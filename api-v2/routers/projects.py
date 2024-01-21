from fastapi import APIRouter, Depends, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pdf2image import convert_from_path
from langchain_community.document_loaders import PyPDFLoader
from PIL.Image import Image
from langchain.docstore.document import Document

from dependencies import get_db
import schemas, helpers
import time
import chain
import models
import env

router = APIRouter(
    prefix='/projects',
    tags=['Projects'],
    dependencies=[Depends(get_db)]
)

def ocr_task(project_id: int, page_number: int, image: Image, db: Session):
    print(f'[Background tasks] Project: {project_id}, Page: {page_number} Converting image to text...')

    text = helpers.image_to_text(image)
    db.add(models.Page(number=page_number, content=text, project_id=project_id))
    db.commit()

def update_project_ocr_status(project_id: int, status: bool, db: Session):
    print(f'[Background tasks] Project: {project_id} - Set in_ocr_process to {status}')

    db.query(models.Project).filter(models.Project.id == project_id).update({'in_ocr_process': False})
    db.commit()

def update_title_task(project_id: int, db: Session):
    print(f'[Background tasks] Project: {project_id} - Update project title')

    pages = db.query(models.Page).filter(models.Page.project_id == project_id).all()[:5]
    doc = []

    for page in pages:
        doc.append(Document(page_content=str(page.content)))

    title = 'Dev title'

    if env.PRODUCT_ENV: # If in production, use title chain to get title (TODO: Do not call API in development mode because it is expensive)
        title = chain.title_chain.invoke({'context': doc}).strip()

    db.query(models.Project).filter(models.Project.id == project_id).update({'title': title})
    db.commit()

@router.post('', tags=['Projects'], summary='Create a new project', response_model=schemas.Project)
async def create_project(file: UploadFile, bg_tasks: BackgroundTasks, use_ocr = False, db: Session = Depends(get_db)):
    if file.content_type not in ['application/pdf']:
        raise HTTPException(status_code=400, detail='Only PDF file is supported')

    filename = f'./uploads/{time.time()}.pdf'
    with open(filename, 'wb') as f:
        f.write(file.file.read())

    project = models.Project(title='Processing project', filepath=filename)
    db.add(project)
    db.commit()

    if use_ocr == 'true':
        # If use OCR, convert PDF to images and add OCR task to background tasks
        images = convert_from_path(filename, 200)

        bg_tasks.add_task(update_project_ocr_status, project.id, True, db) # type: ignore # Set project in_ocr_process to True

        for i, image in enumerate(images):
            bg_tasks.add_task(ocr_task, project.id, i+1, image, db) # type: ignore

        bg_tasks.add_task(update_project_ocr_status, project.id, False, db) # type: ignore # Set project in_ocr_process to False
        bg_tasks.add_task(update_title_task, project.id, db) # type: ignore # Update project title
    else:
        pages = PyPDFLoader(filename).load_and_split()[:5]

        for i, page in enumerate(pages):
            db.add(models.Page(number=i+1, content=page.page_content, project_id=project.id))
            db.commit()

        try:
            title = 'Dev title'
            if env.PRODUCT_ENV: # If in production, use title chain to get title
                title = chain.title_chain.invoke({'context': pages}).strip()

            db.query(models.Project).filter(models.Project.id == project.id).update({'title': title})
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return project

@router.get('', tags=['Projects'], summary='Get all projects', response_model=list[schemas.Project])
async def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Project).offset(skip).limit(limit).all()

@router.get('/{project_id}', tags=['Projects'], summary='Get a project', response_model=schemas.Project)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

@router.get('/{project_id}/text', tags=['Projects'], summary='Get document text')
async def get_docs_string(project_id: int, db: Session = Depends(get_db)) -> str:
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    texts = "\n".join(map(lambda page: str(page.content), project.pages))
    return texts


@router.delete('', tags=['Projects'], summary='Delete all projects')
async def delete_all_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).delete()

@router.get('/{project_id}/pdf', tags=['Projects'], summary='Get pdf of a project')
async def get_pdf(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    with open(str(project.filepath), 'rb') as f:
        return Response(content=f.read(), media_type='application/pdf')
