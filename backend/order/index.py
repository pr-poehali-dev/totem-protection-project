import json
import os
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    '''
    Business: принимает заявку на заказ тотемов и отправляет её в Telegram Ольге.
    Args: event с httpMethod, body (JSON: name, contact, comment, items, total)
    Returns: HTTP-ответ со статусом отправки
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    body = json.loads(event.get('body') or '{}')
    name = (body.get('name') or '').strip()
    contact = (body.get('contact') or '').strip()
    comment = (body.get('comment') or '').strip()
    items = body.get('items') or []
    total = body.get('total') or 0

    if not name or not contact:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Имя и контакт обязательны'}),
        }

    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    if not token or not chat_id:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Telegram не настроен'}),
        }

    items_lines = '\n'.join(
        f"  • {it.get('name', '')} ×{it.get('qty', 1)}" for it in items
    ) or '  —'

    text = (
        '🔮 <b>Новая заявка на тотем</b>\n\n'
        f'<b>Имя:</b> {name}\n'
        f'<b>Контакт:</b> {contact}\n'
        f'<b>Состав заказа:</b>\n{items_lines}\n'
        f'<b>Сумма:</b> {total} ₽\n'
    )
    if comment:
        text += f'<b>Комментарий:</b> {comment}\n'

    api_url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }).encode()

    req = urllib.request.Request(api_url, data=payload)
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp.read()

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False,
    }
