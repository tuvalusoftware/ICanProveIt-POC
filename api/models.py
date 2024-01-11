from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filepath = Column(String, nullable=False, unique=True)

    chapters = relationship("Chapter", back_populates="project")

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    first_page = Column(Integer, nullable=False)
    last_page = Column(Integer, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="chapters")
    questions = relationship("Question", back_populates="chapter")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))

    chapter = relationship("Chapter", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    answer = Column(String, nullable=False)
    is_true = Column(Boolean, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="answers")
