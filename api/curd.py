from sqlalchemy.orm import Session

import models, schemas

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(title=project.title, filepath=project.filepath)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int) -> schemas.Project:
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def delete_all_projects(db: Session):
    db.query(models.Project).delete()
    db.commit()

def create_chapter(db: Session, chapter: schemas.ChapterCreate):
    db_chapter = models.Chapter(**chapter.dict())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

def get_chapters(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Chapter).offset(skip).limit(limit).all()

def get_chapter(db: Session, chapter_id: int) -> schemas.Chapter:
    return db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()

def create_question(db: Session, question: schemas.QuestionCreate) -> schemas.Question:
    db_question = models.Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def create_answer(db: Session, answer: schemas.AnswerCreate) -> schemas.Answer:
    db_answer = models.Answer(**answer.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer
