import time
import json

from fastapi import FastAPI, UploadFile, Depends, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from sqlalchemy.orm import Session

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
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail='Only PDF file is supported')

    filename = f'./uploads/{time.time()}.pdf'
    with open(filename, 'wb') as f:
        f.write(file.file.read())

    pages = PyPDFLoader(filename).load_and_split()[:5]

    try:
        title = chain.title_chain.invoke({'context': pages}).strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    project = schemas.ProjectCreate(title=title, filepath=filename)

    return curd.create_project(db, project)

@app.get('/projects', tags=['Projects'], summary='Get all projects', response_model=list[schemas.Project])
async def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return curd.get_projects(db, skip=skip, limit=limit)

@app.get('/projects/{project_id}', tags=['Projects'], summary='Get a project', response_model=schemas.Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    return curd.get_project(db, project_id=project_id)

@app.get('/projects/{project_id}/text', tags=['Projects'], summary='Get document text')
async def get_docs_string(project_id: int, db: Session = Depends(get_db)) -> str:
    project = curd.get_project(db, project_id=project_id)
    docs = PyPDFLoader(project.filepath).load()
    return helpers.pretty_docs(docs)

@app.delete('/projects', tags=['Projects'], summary='Delete all projects')
async def delete_all_projects(db: Session = Depends(get_db)):
    return curd.delete_all_projects(db)

@app.get('/projects/{project_id}/pdf', tags=['Projects'], summary='Get pdf of a project')
async def get_pdf(project_id: int, db: Session = Depends(get_db)):
    project = curd.get_project(db, project_id=project_id)

    with open(project.filepath, 'rb') as f:
        return Response(content=f.read(), media_type='application/pdf')

@app.post('/projects/{project_id}/chapters/generate', tags=['Chapters', 'Projects'], summary='Generate new chapter', response_model=schemas.Project)
async def generate_chapters(project_id: int, db: Session = Depends(get_db)):
    project = curd.get_project(db, project_id=project_id)

    pages = PyPDFLoader(project.filepath).load_and_split()

    try:
        chapters = json.loads(chain.chapter_chain.invoke({'context': pages}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    print(chapters)

    for chapter in chapters:
        title = chapter['title']
        first_page = int(chapter['first_page'])
        last_page = int(chapter['last_page'])

        chapter = schemas.ChapterCreate(title=title, first_page=int(first_page), last_page=int(last_page), project_id=project_id)
        curd.create_chapter(db, chapter)

    return curd.get_project(db, project_id=project_id)

@app.get('/chapters', tags=['Chapters'], summary='Get all chapters', response_model=list[schemas.Chapter])
async def get_chapters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return curd.get_chapters(db, skip=skip, limit=limit)

@app.post('/chapters/{chapter_id}/questions/generate', tags=['Questions', 'Chapters'], summary='Generate new questions', response_model=schemas.Chapter)
async def generate_questions(chapter_id: int, db: Session = Depends(get_db)):
    chapter = curd.get_chapter(db, chapter_id=chapter_id)
    project = curd.get_project(db, project_id=chapter.project_id)

    pages = PyPDFLoader(project.filepath).load_and_split()

    try:
        questions = json.loads(chain.question_chain.invoke({'context': pages[chapter.first_page-1:chapter.last_page+1], 'topic': chapter.title}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    print(questions)

    for question in questions:
        question_text = question['question']
        created_question = curd.create_question(db, schemas.QuestionCreate(question=question_text, chapter_id=chapter_id))

        answers = question['answers']
        for answer in answers:
            answer_text = answer['answer']
            is_true = bool(answer['is_true'])
            curd.create_answer(db, schemas.AnswerCreate(answer=answer_text, question_id=created_question.id, is_true=is_true))

    return curd.get_chapter(db, chapter_id=chapter_id)
