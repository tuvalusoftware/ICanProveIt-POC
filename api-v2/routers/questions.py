import time, json

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

import schemas, models, env, chain, templates

from dependencies import get_db

router = APIRouter(
    prefix='/questions',
    tags=['Questions'],
    dependencies=[Depends(get_db)]
)

def gen_questions_task(page: schemas.Page, db: Session):
    print(f'[Background tasks] Generate question for page {page.id}]')

    try:
        questions_text = templates.DEFAULT_QUESTIONS_STRING

        if env.PRODUCT_ENV: # TODO: Do not call API in development mode
            questions_text = chain.question_chain.invoke({'context': page.content})

        print(f'Generate question for page {page.id}: {questions_text}')

        start = time.time()

        questions_json = json.loads(questions_text)

        for question in questions_json:
            created_question = models.Question(level=question['level'], question=question['question'], project_id=page.project_id, page_id=page.id)
            db.add(created_question)
            db.commit()

            for answer in question['answers']:
                db.add(models.Answer(answer=answer['answer'], is_true=answer['is_true'], question_id=created_question.id))
                db.commit()

        end = time.time()

        if env.PRODUCT_ENV:
            time.sleep(20 - end + start) # 20 - (end - start)
            print(f'[Background tasks] Sleep for {20 - end + start} seconds')
        else:
            time.sleep(1)
            print(f'[Background tasks] Sleep for 1 seconds')

    except Exception as e:
        print(f'Generate question error: {e}')

def update_question_status_task(project_id: int, status: bool, db: Session):
    print(f'[Background tasks] Project: {project_id} - Set in_question_process to {status}')

    db.query(models.Project).filter(models.Project.id == project_id).update({'in_question_process': status})
    db.commit()

@router.post('', summary='Generate list of questions for a project', response_model=list[schemas.Question])
async def generate_questions(project_id: int, bg_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if project.in_ocr_process or project.in_question_process: # type: ignore
        raise HTTPException(status_code=400, detail='Project is in OCR process or generating questions')

    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    bg_tasks.add_task(update_question_status_task, project_id, True, db) # Update project in_question_process to True

    for page in project.pages:
        # Generate questions for each page
        bg_tasks.add_task(gen_questions_task, page, db)

    bg_tasks.add_task(update_question_status_task, project_id, False, db) # Update project in_question_process to False

    return db.query(models.Question).where(models.Question.project_id == project_id).all()

@router.get('', summary='Get all questions', response_model=list[schemas.Question])
async def get_questions(skip: int = 0, limit: int = 100, project_id=None, db: Session = Depends(get_db)):
    query = db.query(models.Question)

    if project_id:
        query = query.where(models.Question.project_id == project_id)
    if skip:
        query = query.offset(skip)
    if limit:
        query = query.limit(limit)

    return query.all()

@router.get('/{question_id}', summary='Get a question', response_model=schemas.Question)
async def get_question(question_id: int, db: Session = Depends(get_db)):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

@router.delete('', summary='Delete all questions')
async def delete_all_questions(db: Session = Depends(get_db)):
    db.query(models.Question).delete()
    db.commit()
