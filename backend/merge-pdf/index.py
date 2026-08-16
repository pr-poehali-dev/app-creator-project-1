import os
import io
import json
import base64
import uuid
import urllib.request

import boto3
from pypdf import PdfWriter, PdfReader
from PIL import Image

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

# A4 в пунктах (1 пт = 1/72 дюйма)
A4_W, A4_H = 595.28, 841.89
DOWNLOAD_TIMEOUT = 20
MAX_FILE_BYTES = 60 * 1024 * 1024


def _resp(status, payload):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(payload, ensure_ascii=False),
    }


def _download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'geo-report/1.0'})
    with urllib.request.urlopen(req, timeout=DOWNLOAD_TIMEOUT) as r:
        return r.read(MAX_FILE_BYTES)


def _image_to_pdf(data: bytes) -> bytes:
    # Карты и схемы приходят картинками — вписываем в лист A4 без искажения пропорций
    img = Image.open(io.BytesIO(data))
    if img.mode in ('RGBA', 'LA', 'P'):
        bg = Image.new('RGB', img.size, 'white')
        img = img.convert('RGBA')
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Широкие карты кладём горизонтально, чтобы занимали лист целиком
    page_w, page_h = (A4_H, A4_W) if img.width > img.height else (A4_W, A4_H)

    out = io.BytesIO()
    img.save(out, format='PDF', resolution=150.0)
    out.seek(0)

    reader = PdfReader(out)
    writer = PdfWriter()
    for page in reader.pages:
        page.scale_to(page_w, page_h)
        writer.add_page(page)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def _is_pdf(data: bytes) -> bool:
    return data[:5] == b'%PDF-'


def handler(event: dict, context) -> dict:
    """Склеивает основной отчёт и приложения (PDF, карты, схемы) в один файл для печати."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return _resp(405, {'error': 'method not allowed'})

    body = json.loads(event.get('body') or '{}')
    base_url = body.get('baseUrl')
    base_b64 = body.get('baseFile')
    attachments = body.get('attachments') or []
    filename = body.get('filename') or 'report.pdf'

    if not base_url and not base_b64:
        return _resp(400, {'error': 'baseUrl or baseFile required'})

    writer = PdfWriter()
    merged, skipped = 0, []

    # 1. Основной отчёт
    try:
        base_data = _download(base_url) if base_url else base64.b64decode(base_b64)
        for page in PdfReader(io.BytesIO(base_data)).pages:
            writer.add_page(page)
        merged += 1
    except Exception as e:
        return _resp(400, {'error': f'не удалось прочитать основной отчёт: {e}'})

    # 2. Приложения по порядку. Сбой одного файла не должен рушить весь документ
    for item in attachments:
        url = (item or {}).get('url')
        title = (item or {}).get('title') or (item or {}).get('filename') or 'приложение'
        if not url:
            continue
        try:
            data = _download(url)
            pdf_bytes = data if _is_pdf(data) else _image_to_pdf(data)
            for page in PdfReader(io.BytesIO(pdf_bytes)).pages:
                writer.add_page(page)
            merged += 1
        except Exception as e:
            skipped.append({'title': title, 'reason': str(e)[:200]})

    out = io.BytesIO()
    writer.write(out)
    out.seek(0)
    result = out.read()

    # 3. Кладём в хранилище и отдаём ссылку
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    key = f"geo-merged/{uuid.uuid4()}.pdf"
    s3.put_object(Bucket='files', Key=key, Body=result, ContentType='application/pdf')
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return _resp(200, {
        'url': cdn_url,
        'filename': filename,
        'pages': len(writer.pages),
        'merged': merged,
        'skipped': skipped,
    })
