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


def _passport_response(status, payload):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def _handle_passport(method, cur, event, body):
    # GET: reportId из query. POST/DELETE: reportId из тела.
    if method == 'GET':
        qs = event.get('queryStringParameters') or {}
        report_id = str(qs.get('reportId') or '')
        if not report_id:
            return _passport_response(400, {'error': 'reportId required'})
        cur.execute("SELECT report_id, massif, data FROM gkm_passports WHERE report_id = %s", (report_id,))
        row = cur.fetchone()
        if not row:
            return _passport_response(200, {'passport': None})
        return _passport_response(200, {'passport': {'reportId': row['report_id'], 'massif': row['massif'], 'data': row['data']}})

    report_id = str(body.get('reportId') or '')
    if not report_id:
        return _passport_response(400, {'error': 'reportId required'})

    if method == 'DELETE':
        cur.execute("DELETE FROM gkm_passports WHERE report_id = %s", (report_id,))
        return _passport_response(200, {'ok': True})

    if method == 'POST':
        massif = str(body.get('massif') or '')
        data = body.get('data') or {}
        cur.execute(
            "INSERT INTO gkm_passports (report_id, massif, data) VALUES (%s, %s, %s) "
            "ON CONFLICT (report_id) DO UPDATE SET massif = EXCLUDED.massif, data = EXCLUDED.data, updated_at = now() "
            "RETURNING report_id, massif, data",
            (report_id, massif, json.dumps(data, ensure_ascii=False)),
        )
        row = cur.fetchone()
        return _passport_response(200, {'passport': {'reportId': row['report_id'], 'massif': row['massif'], 'data': row['data']}})

    return _passport_response(405, {'error': 'method not allowed'})


def _report_row(row):
    # data содержит всю карточку ReportData; id/title дублируются в колонках
    data = dict(row['data'] or {})
    data['id'] = row['id']
    if row.get('title') is not None:
        data.setdefault('title', row['title'])
    return data


def _handle_reports(method, cur, event, body):
    # GET: список всех отчётов, либо один по ?id=. POST: upsert. DELETE: по id.
    if method == 'GET':
        qs = event.get('queryStringParameters') or {}
        rep_id = str(qs.get('id') or '')
        if rep_id:
            cur.execute("SELECT id, title, data FROM reports WHERE id = %s", (rep_id,))
            row = cur.fetchone()
            return _passport_response(200, {'report': _report_row(row) if row else None})
        cur.execute("SELECT id, title, data FROM reports ORDER BY created_at")
        rows = cur.fetchall()
        return _passport_response(200, {'reports': [_report_row(r) for r in rows]})

    if method == 'DELETE':
        rep_id = str(body.get('id') or '')
        if not rep_id:
            return _passport_response(400, {'error': 'id required'})
        cur.execute("DELETE FROM reports WHERE id = %s", (rep_id,))
        return _passport_response(200, {'ok': True})

    if method == 'POST':
        item = body.get('item') or {}
        rep_id = str(item.get('id') or '')
        if not rep_id:
            return _passport_response(400, {'error': 'id required'})
        title = str(item.get('title') or '')
        cur.execute(
            "INSERT INTO reports (id, title, data) VALUES (%s, %s, %s) "
            "ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, data = EXCLUDED.data, updated_at = now() "
            "RETURNING id, title, data",
            (rep_id, title, json.dumps(item, ensure_ascii=False)),
        )
        row = cur.fetchone()
        return _passport_response(200, {'report': _report_row(row)})

    return _passport_response(405, {'error': 'method not allowed'})


# Блоки отчёта: имя блока -> таблица
BLOCKS = {
    'label': 'report_label',
    'title_page': 'report_title_page',
    'abstract': 'report_abstract',
    'task_file': 'report_task_file',
    'intro': 'report_intro',
    'main_text': 'report_main_text',
    'conclusion': 'report_conclusion',
    'terms': 'report_terms',
    'references': 'report_references',
    'study': 'report_study',
    'illustrations': 'report_illustrations',
    'tables': 'report_tables',
    'text_appendices': 'report_text_appendices',
    'graphic_appendices': 'report_graphic_appendices',
    'text_app_files': 'report_text_app_files',
    'graphic_app_files': 'report_graphic_app_files',
    'metrological': 'report_metrological',
    'patent': 'report_patent',
    'review': 'report_review',
    'protocol': 'report_protocol',
    'cost': 'report_cost',
    'transfer_acts': 'report_transfer_acts',
    'contents_pages': 'report_contents_pages',
    'contents_custom': 'report_contents_custom',
}


def _handle_section_meta(method, cur, event, body):
    # Подписи разделов: ключ отчёт + вкладка
    if method == 'GET':
        qs = event.get('queryStringParameters') or {}
        report_id = str(qs.get('reportId') or '')
        tab_id = str(qs.get('tabId') or '')
    else:
        report_id = str(body.get('reportId') or '')
        tab_id = str(body.get('tabId') or '')

    # Удаление всего отчёта: чистим подписи всех его разделов разом
    if method == 'DELETE' and report_id and not tab_id:
        cur.execute("DELETE FROM report_section_meta WHERE report_id = %s", (report_id,))
        return _passport_response(200, {'ok': True})

    if not report_id or not tab_id:
        return _passport_response(400, {'error': 'reportId and tabId required'})

    if method == 'GET':
        cur.execute("SELECT data FROM report_section_meta WHERE report_id = %s AND tab_id = %s", (report_id, tab_id))
        row = cur.fetchone()
        return _passport_response(200, {'data': row['data'] if row else None})

    if method == 'POST':
        data = body.get('data')
        if data is None:
            return _passport_response(400, {'error': 'data required'})
        cur.execute(
            "INSERT INTO report_section_meta (report_id, tab_id, data) VALUES (%s, %s, %s) "
            "ON CONFLICT (report_id, tab_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now() "
            "RETURNING data",
            (report_id, tab_id, json.dumps(data, ensure_ascii=False)),
        )
        row = cur.fetchone()
        return _passport_response(200, {'data': row['data']})

    if method == 'DELETE':
        cur.execute("DELETE FROM report_section_meta WHERE report_id = %s AND tab_id = %s", (report_id, tab_id))
        return _passport_response(200, {'ok': True})

    return _passport_response(405, {'error': 'method not allowed'})


def _handle_block(method, cur, event, body):
    # Универсальный CRUD блоков отчёта. block — имя блока, reportId — отчёт.
    if method == 'GET':
        qs = event.get('queryStringParameters') or {}
        block = qs.get('block') or ''
        report_id = str(qs.get('reportId') or '')
    else:
        block = body.get('block') or ''
        report_id = str(body.get('reportId') or '')

    if block not in BLOCKS:
        return _passport_response(400, {'error': 'unknown block'})
    if not report_id:
        return _passport_response(400, {'error': 'reportId required'})
    table = BLOCKS[block]

    if method == 'GET':
        cur.execute(f"SELECT data FROM {table} WHERE report_id = %s", (report_id,))
        row = cur.fetchone()
        return _passport_response(200, {'data': row['data'] if row else None})

    if method == 'DELETE':
        cur.execute(f"DELETE FROM {table} WHERE report_id = %s", (report_id,))
        return _passport_response(200, {'ok': True})

    if method == 'POST':
        data = body.get('data')
        if data is None:
            return _passport_response(400, {'error': 'data required'})
        cur.execute(
            f"INSERT INTO {table} (report_id, data) VALUES (%s, %s) "
            f"ON CONFLICT (report_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now() "
            f"RETURNING data",
            (report_id, json.dumps(data, ensure_ascii=False)),
        )
        row = cur.fetchone()
        return _passport_response(200, {'data': row['data']})

    return _passport_response(405, {'error': 'method not allowed'})


def handler(event, context):
    '''Общая база: справочники, паспорта ГКМ, отчёты и блоки отчётов.
    GET — справочники, паспорт (resource=passport&reportId=..) или отчёты (resource=reports).
    POST — upsert записи. DELETE — удалить.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = _conn()
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        body = {}
        if method in ('POST', 'DELETE'):
            body = json.loads(event.get('body') or '{}')

        # Роутинг по ресурсам
        qs = event.get('queryStringParameters') or {}
        resource = qs.get('resource') or body.get('resource')
        if resource == 'passport':
            return _handle_passport(method, cur, event, body)
        if resource == 'reports':
            return _handle_reports(method, cur, event, body)
        if resource == 'block':
            return _handle_block(method, cur, event, body)
        if resource == 'section_meta':
            return _handle_section_meta(method, cur, event, body)

        if method == 'GET':
            data = _fetch_all(cur)
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(data, ensure_ascii=False, default=str)}

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