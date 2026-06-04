import os
import json
import base64
import boto3
import uuid

def handler(event: dict, context) -> dict:
    """Загружает файл (base64) в S3 и возвращает CDN-URL."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    file_b64 = body.get('file')
    filename = body.get('filename', 'file')
    content_type = body.get('contentType', 'application/octet-stream')
    folder = body.get('folder', 'uploads')

    if not file_b64:
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': '{"error": "file required"}'}

    file_data = base64.b64decode(file_b64)
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'bin'
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=file_data, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'url': cdn_url, 'key': key, 'filename': filename}),
    }