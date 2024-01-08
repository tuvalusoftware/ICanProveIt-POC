import time

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from chain import chain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.post('/pdf-to-text', tags=['PDF'], summary='Convert PDF to Text')
async def pdf_to_text(file: UploadFile):
    filename = f'./{time.time()}.pdf'

    with open(filename, 'wb') as f:
        f.write(file.file.read())

    loader = PyPDFLoader(filename)
    pages = loader.load_and_split()

    return pages

@app.post('/pdf-to-questions', tags=['PDF'], summary='Convert PDF to Questions')
async def pdf_to_questions(file: UploadFile):
    pages = pdf_to_questions(file)
    chapters = chain.invoke({'input': 'Generate list of main points, format: Title (start_page-end_page)', 'context': pages}).split('\n')
    result = []

    for chapter in chapters:
        questions = []
        questions_text = chain.invoke({'input': f'Generate questions and answer of {chapter}, format: q: question -- a: answer', 'context': pages})
        questions_split = questions_text.split('\n')

        print(f'[PDF to questions] Chapter: {chapter}')

        print(f'[PDF to questions] {questions_text}')

        for i in range(0, len(questions_text.split('\n')), 3):
            questions.append({'question': questions_split[i].replace('q:', '').strip(), 'answer': questions_split[i+1].replace('a:', '').strip()})

        result.append({'chapter': chapter, 'questions': questions})

        time.sleep(20) # Wait for 20 seconds because we poor

    return result

