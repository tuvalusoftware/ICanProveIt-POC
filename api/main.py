import time

from fastapi import FastAPI, UploadFile, Depends, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from sqlalchemy.orm import Session

import models, curd, schemas, chain
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
        chapters = chain.chapter_chain.invoke({'context': pages}).split('\n')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    print(chapters)

    for chapter in chapters:
        chapter_splited = chapter.split('--')
        if len(chapter_splited) != 3:
            continue

        title = chapter_splited[0].strip()
        first_page = chapter_splited[1].strip()
        last_page = chapter_splited[2].strip()

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
        questions = chain.question_chain.invoke({'context': pages[chapter.first_page-1:chapter.last_page+1], 'topic': chapter.title}).split('\n')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    for i in range(0, len(questions), 3):
        question = schemas.QuestionCreate(question=questions[i].replace('q:', '').strip(), answer=questions[i+1].replace('a:', '').strip(), chapter_id=chapter_id)
        curd.create_question(db, question)

    return curd.get_chapter(db, chapter_id=chapter_id)

# @app.post('/pdf-to-text', tags=['PDF'], summary='Convert PDF to Text')
# async def pdf_to_text(file: UploadFile):
#     filename = f'./{time.time()}.pdf'

#     with open(filename, 'wb') as f:
#         f.write(file.file.read())

#     loader = PyPDFLoader(filename)
#     pages = loader.load_and_split()

#     return pages

# @app.post('/pdf-to-questions', tags=['PDF'], summary='Convert PDF to Questions')
# async def pdf_to_questions(file: UploadFile):
#     pages = pdf_to_questions(file)
#     chapters = chain.invoke({'input': 'Generate list of main points, format: Title (start_page-end_page)', 'context': pages}).split('\n')
#     result = []

#     for chapter in chapters:
#         questions = []
#         questions_text = chain.invoke({'input': f'Generate questions and answer of {chapter}, format: q: question -- a: answer', 'context': pages})
#         questions_split = questions_text.split('\n')

#         print(f'[PDF to questions] Chapter: {chapter}')

#         print(f'[PDF to questions] {questions_text}')

#         for i in range(0, len(questions_text.split('\n')), 3):
#             questions.append({'question': questions_split[i].replace('q:', '').strip(), 'answer': questions_split[i+1].replace('a:', '').strip()})

#         result.append({'chapter': chapter, 'questions': questions})

#         time.sleep(20) # Wait for 20 seconds because we poor

#     return result

