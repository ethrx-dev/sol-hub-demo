import asyncio
from datetime import datetime, timedelta
from celery import Celery

app = Celery('sol_hub_worker', broker='redis://localhost:6379/0')

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    beat_schedule={
        'cleanup-expired-tokens': {
            'task': 'src.tasks.cleanup_expired_tokens',
            'schedule': timedelta(hours=24),
        },
    },
)


@app.task
def send_email_task(to: str, subject: str, body: str) -> dict:
    print(f'[EMAIL] To: {to}, Subject: {subject}, Body: {body}')
    return {'status': 'sent', 'to': to, 'subject': subject}


@app.task
def process_video_upload(url: str, project_id: str) -> dict:
    print(f'[VIDEO] Processing upload: {url} for project {project_id}')
    return {'status': 'processed', 'url': url, 'project_id': project_id}


@app.task
def run_matching_algorithm() -> dict:
    print('[MATCH] Running matching algorithm...')
    return {'status': 'completed', 'matches_found': 0}


@app.task
def send_notification(user_id: str, type: str, title: str, body: str, link: str | None = None) -> dict:
    print(f'[NOTIFICATION] User: {user_id}, Type: {type}, Title: {title}, Body: {body}, Link: {link}')
    return {
        'status': 'created',
        'user_id': user_id,
        'type': type,
        'title': title,
    }


@app.task
def cleanup_expired_tokens() -> dict:
    print('[CLEANUP] Cleaning expired refresh tokens...')
    return {'status': 'completed', 'tokens_removed': 0}


@app.task
def generate_project_report(project_id: str) -> dict:
    print(f'[REPORT] Generating milestone report for project {project_id}')
    return {
        'status': 'generated',
        'project_id': project_id,
        'generated_at': datetime.utcnow().isoformat(),
    }
