from fastapi import APIRouter
from pydantic import BaseModel

import env

class Status(BaseModel):
    PRODUCT_ENV: bool

router = APIRouter(
    prefix='/check',
    tags=['Check'],
)

@router.get('/status', response_model=Status)
def get_status():
    return {
        'PRODUCT_ENV': env.PRODUCT_ENV
    }