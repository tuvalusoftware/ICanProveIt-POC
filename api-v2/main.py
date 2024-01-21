import models

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from dependencies import get_db
from routers import projects, pages, questions

models.Base.metadata.create_all(bind=engine)

app = FastAPI(dependencies=[Depends(get_db)])

app.include_router(projects.router)
app.include_router(pages.router)
app.include_router(questions.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

