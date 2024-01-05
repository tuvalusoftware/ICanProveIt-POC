import time

from fastapi import FastAPI, UploadFile
from PyPDF2 import PdfReader
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

MAX_INPUT_TOKENS = 256

generate_questions_pipe = pipeline("text2text-generation", model="thangved/t5-generate-question")
qa_pipe = pipeline("question-answering", model="SharKRippeR/QA_T5_small_seq2seq")

class PdfToTextRes(BaseModel):
    text: str

class GenerateQuestionsReq(BaseModel):
    text: str

class QuestionAndContext(BaseModel):
    question: str
    context: str

class GenerateQuestionsRes(BaseModel):
    questions: list[QuestionAndContext]
    time: float

class GenerateAnswerReq(BaseModel):
    context: str
    question: str

class GenerateAnswerRes(BaseModel):
    answer: str

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

def split_questions(text:str) -> list[str]:
    texts = text.split('Question:')
    questions = []

    for txt in texts:
        txt = txt.strip()
        if txt != '':
            questions.append(txt)

    return questions

@app.post('/pdf/to-text', response_model=PdfToTextRes, tags=['PDF'], summary='Convert PDF to Text')
def pdf_to_text(file: UploadFile):
    reader = PdfReader(file.file)

    pages = reader.pages

    text = ''

    for page in pages:
        text += f'{page.extract_text()}\n'

    return PdfToTextRes(text=text)

@app.post('/generate/pdf-to-questions', response_model=GenerateQuestionsRes, tags=['Generate'], summary='Generate Questions from PDF')
def pdf_to_questions(file: UploadFile):
    text = pdf_to_text(file).text
    return generate_questions(GenerateQuestionsReq(text=text))

@app.post('/generate/questions', response_model=GenerateQuestionsRes, tags=['Generate'], summary='Generate Questions')
def generate_questions(req: GenerateQuestionsReq):
    start = time.time()
    result = GenerateQuestionsRes(questions=[], time=0)

    tokens = req.text.split(' ')
    for i in range(0, len(tokens), MAX_INPUT_TOKENS):
        context =' '.join(tokens[i:i+MAX_INPUT_TOKENS])
        raw_questions:str = generate_questions_pipe(f'gq:{context}')[0]['generated_text'] # type: ignore
        result.questions += map(lambda q: QuestionAndContext(question=q, context=context), split_questions(raw_questions)) # type: ignore

    end = time.time()
    result.time = end - start

    return result

@app.post('/generate/answer', response_model=GenerateAnswerRes, tags=['Generate'], summary='Generate Answers')
def generate_answer(req: GenerateAnswerReq):
    answer_raw:str = qa_pipe({'context': req.context, 'question': req.question})['answer'] # type: ignore
    return GenerateAnswerRes(answer=answer_raw)