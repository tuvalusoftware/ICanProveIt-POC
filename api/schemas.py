from pydantic import BaseModel

class AnswerBase(BaseModel):
    answer: str
    is_true: bool = False

class AnswerCreate(AnswerBase):
    question_id: int

class Answer(AnswerBase):
    id: int
    question_id: int

    class Config:
        orm_mode = True

class QuestionBase(BaseModel):
    question: str

class QuestionCreate(QuestionBase):
    chapter_id: int

class Question(QuestionBase):
    id: int
    chapter_id: int
    answers: list[Answer] = []

    class Config:
        orm_mode = True

class ChapterBase(BaseModel):
    title: str
    first_page: int
    last_page: int
    project_id: int

class ChapterCreate(ChapterBase):
    project_id: int

class Chapter(ChapterBase):
    id: int
    project_id: int
    questions: list[Question] = []

    class Config:
        orm_mode = True


class ProjectBase(BaseModel):
    title: str
    filepath: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    chapters: list[Chapter] = []

    class Config:
        orm_mode = True

