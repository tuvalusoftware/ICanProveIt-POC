from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
import datetime

from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filepath = Column(String, nullable=False, unique=True)
    in_ocr_process = Column(Boolean, nullable=False, default=False)
    in_question_process = Column(Boolean, nullable=False, default=False)

    questions = relationship("Question", back_populates="project", cascade="all, delete")
    pages = relationship("Page", back_populates="project", cascade="all, delete")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="pages", cascade="all, delete")
    questions = relationship("Question", back_populates="page", cascade="all, delete")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    level = Column(String, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"))
    page_id = Column(Integer, ForeignKey("pages.id"))

    project = relationship("Project", back_populates="questions", cascade="all, delete")
    page = relationship("Page", back_populates="questions", cascade="all, delete")
    answers = relationship("Answer", back_populates="question", cascade="all, delete")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    answer = Column(String, nullable=False)
    is_true = Column(Boolean, nullable=False)

    question_id = Column(Integer, ForeignKey("questions.id"))

    question = relationship("Question", back_populates="answers", cascade="all, delete")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
