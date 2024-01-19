import time
import json

from fastapi import FastAPI, UploadFile, Depends, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pdf2image import convert_from_path

import models, curd, schemas, chain, helpers
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.post('/projects', tags=['Projects'], summary='Create a new project', response_model=schemas.Project)
async def create_project(file: UploadFile, db: Session = Depends(get_db)):
    if file.content_type not in ['application/pdf']:
        raise HTTPException(status_code=400, detail='Only PDF file is supported')

    filename = f'./uploads/{time.time()}.pdf'
    with open(filename, 'wb') as f:
        f.write(file.file.read())

    images = convert_from_path(filename, 500)
    texts = []

    for img in images:
        text = helpers.image_to_text(img)
        texts.append(text)

    try:
        # title = chain.title_chain.invoke({'context': texts[:5]}).strip()
        title = "########################################################"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    project = schemas.ProjectCreate(title=title, filepath=filename)
    created_project = curd.create_project(db, project)

    for i, text in enumerate(texts):
        page = schemas.PageCreate(number=i+1, content=text, project_id=created_project.id)
        curd.create_page(db, page)

    return curd.get_project(db, project_id=created_project.id)

    # pages = PyPDFLoader(filename).load_and_split()[:5]

    # try:
    #     title = chain.title_chain.invoke({'context': pages}).strip()
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))

    # project = schemas.ProjectCreate(title=title, filepath=filename)

    # return curd.create_project(db, project)

@app.get('/projects', tags=['Projects'], summary='Get all projects', response_model=list[schemas.ProjectBase])
async def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return curd.get_projects(db, skip=skip, limit=limit)

@app.get('/projects/{project_id}', tags=['Projects'], summary='Get a project', response_model=schemas.Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    return curd.get_project(db, project_id=project_id)

@app.get('/projects/{project_id}/text', tags=['Projects'], summary='Get document text')
async def get_docs_string(project_id: int, db: Session = Depends(get_db)) -> str:
    project = curd.get_project(db, project_id=project_id)
    texts = "\n".join(map(lambda page: page.content, project.pages))
    return texts


@app.delete('/projects', tags=['Projects'], summary='Delete all projects')
async def delete_all_projects(db: Session = Depends(get_db)):
    return curd.delete_all_projects(db)

@app.get('/projects/{project_id}/pdf', tags=['Projects'], summary='Get pdf of a project')
async def get_pdf(project_id: int, db: Session = Depends(get_db)):
    project = curd.get_project(db, project_id=project_id)

    with open(project.filepath, 'rb') as f:
        return Response(content=f.read(), media_type='application/pdf')


@app.post('/questions', tags=['Questions'], summary='Generate list of questions for a project', response_model=list[schemas.Question])
async def generate_questions(project_id: int, db: Session = Depends(get_db)):
    project = curd.get_project(db, project_id=project_id)

    for page in project.pages:
        try:
            questions_text = chain.question_chain.invoke({'context': page.content})

            print(questions_text)

            start = time.time()

            questions_json = json.loads(questions_text)

            for question in questions_json:
                created_question = curd.create_question(db, schemas.QuestionCreate(level=question['level'], question=question['question'], project_id=project_id, page_id=page.id))

                for answer in question['answers']: # type: ignore
                    curd.create_answer(db, schemas.AnswerCreate(answer=answer['answer'], is_true=answer['is_true'], question_id=created_question.id)) # type: ignore

            end = time.time()

            time.sleep(20 - end + start) # 20 - (end - start)
        except Exception as e:
            print(f'Error: {e}')

    # for i in range(10):
    #     q = schemas.QuestionCreate(level='hard', question=f'Question {i + 1}', project_id=project_id, page_id=i+1)
    #     created_question = curd.create_question(db, q)

    #     answers = []

    #     for j in range(4):
    #         a = schemas.AnswerCreate(answer=f'Answer {i + 1}.{j + 1}', question_id=created_question.id)
    #         answers.append(curd.create_answer(db, a))

    #     questions.append(created_question)

    return db.query(models.Question).where(models.Question.project_id == project_id).all()

@app.get('/questions', tags=['Questions'], summary='Get all questions', response_model=list[schemas.Question])
async def get_questions(skip: int = 0, limit: int = 100, project_id=None, db: Session = Depends(get_db)):
    query = db.query(models.Question)

    if project_id:
        query = query.where(models.Question.project_id == project_id)
    if skip:
        query = query.offset(skip)
    if limit:
        query = query.limit(limit)

    return query.all()

@app.get('/questions/{question_id}', tags=['Questions'], summary='Get a question', response_model=schemas.Question)
async def get_question(question_id: int, db: Session = Depends(get_db)):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

@app.delete('/questions', tags=['Questions'], summary='Delete all questions')
async def delete_all_questions(db: Session = Depends(get_db)):
    db.query(models.Question).delete()
    db.commit()