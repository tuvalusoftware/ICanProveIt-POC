import time
import pytesseract

from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_bytes

MAX_INPUT_TOKENS = 128

generate_questions_pipe = pipeline("text2text-generation", model="thangved/t5-generate-question")
qa_pipe = pipeline("question-answering", model="SharKRippeR/QA_T5_small_seq2seq")

class Page(BaseModel):
    text: str
    page: int

class PdfToTextRes(BaseModel):
    pages: list[Page]

class GenerateQuestionsReq(BaseModel):
    pages: list[Page]

class QuestionAndContext(BaseModel):
    context: str
    question: str

class PageWithQuestions(Page):
    questions: list[QuestionAndContext]

class GenerateQuestionsRes(BaseModel):
    pages: list[PageWithQuestions]
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
    pdf_pages = convert_from_bytes(file.file.read())

    result = PdfToTextRes(pages=[])

    for index, page in enumerate(pdf_pages):
        print(f'[Pdf to text] Processing page {index+1} of {len(pdf_pages)}')
        result.pages.append(Page(text=str(pytesseract.image_to_string(page)).encode(errors='ignore').decode(errors='ignore'), page=index+1))

    return result

@app.post('/generate/pdf-to-questions', response_model=GenerateQuestionsRes, tags=['Generate'], summary='Generate Questions from PDF')
def pdf_to_questions(file: UploadFile):
    text = pdf_to_text(file)
    return generate_questions(GenerateQuestionsReq(pages=text.pages))

@app.post('/generate/questions', response_model=GenerateQuestionsRes, tags=['Generate'], summary='Generate Questions')
def generate_questions(req: GenerateQuestionsReq):
    start = time.time()
    result = GenerateQuestionsRes(pages=[], time=0)

    for page in req.pages:
        print(f'[Generate questions] Processing page {page.page} of {len(req.pages)}')

        page = PageWithQuestions(text=page.text, page=page.page, questions=[])
        tokens = page.text.split(' ')

        for i in range(0, len(tokens), MAX_INPUT_TOKENS):
            context = ' '.join(tokens[i:i+MAX_INPUT_TOKENS])
            raw_questions:str = generate_questions_pipe(f'gq:{context}')[0]['generated_text'] # type: ignore
            questions = split_questions(raw_questions)
            page.questions += map(lambda q: QuestionAndContext(context=context, question=q), questions)

        result.pages.append(page)

    end = time.time()
    result.time = end - start

    return result

@app.post('/generate/answer', response_model=GenerateAnswerRes, tags=['Generate'], summary='Generate Answers')
def generate_answer(req: GenerateAnswerReq):
    answer_raw:str = qa_pipe({'context': req.context, 'question': req.question})['answer'] # type: ignore
    return GenerateAnswerRes(answer=answer_raw)