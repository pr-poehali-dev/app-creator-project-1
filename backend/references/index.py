import json
import os
import psycopg2
import psycopg2.extras

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

# Разрешённые справочники и их колонки (kind -> (table, [columns]))
KINDS = {
    'customers':   ('customers',   ['name', 'director', 'inn', 'address']),
    'contractors': ('contractors', ['name', 'director', 'chief_geologist', 'responsible', 'executors']),
    'licenses':    ('licenses',    ['number', 'issue_date', 'owner_id', 'site_name', 'use_type']),
    'contracts':   ('contracts',   ['number', 'date', 'name']),
}

# camelCase (frontend) <-> snake_case (db)
FIELD_MAP = {
    'chiefGeologist': 'chief_geologist',
    'issueDate': 'issue_date',
    'ownerId': 'owner_id',
    'siteName': 'site_name',
    'useType': 'use_type',
}
INV_FIELD_MAP = {v: k for k, v in FIELD_MAP.items()}


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _row_to_camel(row):
    out = {}
    for k, v in dict(row).items():
        key = INV_FIELD_MAP.get(k, k)
        out[key] = v
    return out


def _fetch_all(cur):
    result = {}
    for kind, (table, _cols) in KINDS.items():
        cur.execute(f"SELECT * FROM {table} ORDER BY created_at")
        rows = cur.fetchall()
        items = []
        for r in rows:
            item = _row_to_camel(r)
            item.pop('created_at', None)
            item.pop('updated_at', None)
            items.append(item)
        result[kind] = items
    return result


def handler(event, context):
    '''Общая база справочников: заказчики, исполнители, лицензии, контракты.
    GET — вернуть все справочники. POST — создать/обновить запись (upsert). DELETE — удалить запись.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = _conn()
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if method == 'GET':
            data = _fetch_all(cur)
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(data, ensure_ascii=False, default=str)}

        body = json.loads(event.get('body') or '{}')
        kind = body.get('kind')
        if kind not in KINDS:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown kind'})}
        table, cols = KINDS[kind]

        if method == 'DELETE':
            rec_id = str(body.get('id', ''))
            if not rec_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
            cur.execute(f"DELETE FROM {table} WHERE id = %s", (rec_id,))
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True})}

        if method == 'POST':
            entity = body.get('item') or {}
            rec_id = str(entity.get('id') or '')
            if not rec_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}

            values = []
            for c in cols:
                camel = INV_FIELD_MAP.get(c, c)
                v = entity.get(camel, entity.get(c))
                if c == 'executors':
                    v = json.dumps(v or [], ensure_ascii=False)
                elif v is None:
                    v = ''
                values.append(v)

            col_list = ', '.join(cols)
            placeholders = ', '.join(['%s'] * len(cols))
            updates = ', '.join([f"{c} = EXCLUDED.{c}" for c in cols])
            sql = (
                f"INSERT INTO {table} (id, {col_list}) VALUES (%s, {placeholders}) "
                f"ON CONFLICT (id) DO UPDATE SET {updates}, updated_at = now() "
                f"RETURNING *"
            )
            cur.execute(sql, [rec_id, *values])
            row = cur.fetchone()
            item = _row_to_camel(row)
            item.pop('created_at', None)
            item.pop('updated_at', None)
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'item': item}, ensure_ascii=False, default=str)}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
    finally:
        cur.close()
        conn.close()
