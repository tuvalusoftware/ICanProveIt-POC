from pydantic import BaseModel
import datetime

class AnswerBase(BaseModel):
    answer: str
    is_true: bool = False

class AnswerCreate(AnswerBase):
    question_id: int

class Answer(AnswerBase):
    id: int
    question_id: int

    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question: str
    level: str

class QuestionCreate(QuestionBase):
    project_id: int
    page_id: int

class Question(QuestionBase):
    id: int
    project_id: int
    page_id: int
    answers: list[Answer] = []

    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class PageBase(BaseModel):
    number: int
    content: str

class PageCreate(PageBase):
    project_id: int

class Page(PageBase):
    id: int
    project_id: int
    questions: list[Question] = []

    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    filepath: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    questions: list[Question] = []
    in_ocr_process: bool = False
    in_question_process: bool = False
    pages: list[Page] = []

    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

