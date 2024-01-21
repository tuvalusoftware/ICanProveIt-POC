from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas, models

from dependencies import get_db

router = APIRouter(
    prefix='/pages',
    tags=['Pages'],
    dependencies=[Depends(get_db)]
)

@router.get('', tags=['Pages'], summary='Get all pages', response_model=list[schemas.Page])
async def get_pages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Page).offset(skip).limit(limit).all()

@router.get('/{page_id}', tags=['Pages'], summary='Get a page', response_model=schemas.Page)
async def get_page(page_id: int, db: Session = Depends(get_db)):
    return db.query(models.Page).filter(models.Page.id == page_id).first()
