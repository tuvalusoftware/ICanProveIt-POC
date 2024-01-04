import gradio as gr
import requests
import os

from PyPDF2 import PdfReader
from dotenv import load_dotenv
from os.path import join, dirname

load_dotenv(join(dirname(__file__), '.env'))

HUGGINGFACE_API_KEY = os.environ.get("HUGGINGFACE_API_KEY")

API_URL = "https://api-inference.huggingface.co/models/thangved/t5-generate-question"
headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

MAX_OUTPUT = 3
MAX_INPUT_TOKENS = 256

# Truncate text to 256 tokens
def truncate_text(text:str) -> str:
    tokens = text.split(' ') # Split text into tokens

    # If the number of tokens is greater than 256, truncate it
    if len(tokens) > MAX_INPUT_TOKENS:
        tokens = tokens[:MAX_INPUT_TOKENS]

    # Join tokens back into text
    return ' '.join(tokens)

def generate_questions_request(payload) -> [str]:
    response = requests.post(API_URL, headers=headers, json=payload)

    return response.json()[0]['generated_text'].split('Question:')[1:]

def generate_questions(file):
    if file is None:
        return [''] * MAX_OUTPUT

    reader = PdfReader(file.name)

    text = ''

    for page in reader.pages:
        text += page.extract_text()

    questions = generate_questions_request({'inputs': truncate_text(text)})

    i = len(questions)

    while i < MAX_OUTPUT:
        questions.append('')
        i += 1

    return questions

with gr.Blocks() as demo:
    gr.Markdown("# PDF to Questions")

    with gr.Row():
        inp = gr.File(label='Select file', file_types=['.pdf'])

        with gr.Column():
            ouputs = []

            for i in range(MAX_OUTPUT):
                ouputs.append(gr.Textbox(label=f'Question {i + 1}'))

    btn = gr.Button('Generate')
    btn.click(fn=generate_questions, inputs=inp, outputs=ouputs)

if __name__ == '__main__':
    demo.launch()
