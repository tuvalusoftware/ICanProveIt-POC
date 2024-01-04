import gradio as gr

from transformers import pipeline
from PyPDF2 import PdfReader

generate_question_pipe = pipeline("text2text-generation", model="thangved/t5-generate-question")
qa_pipe = pipeline("question-answering", model="SharKRippeR/QA_T5_small_seq2seq")

MAX_OUTPUT = 3
MAX_INPUT_TOKENS = 256

# Truncate text to 256 tokens
def split_texts(text:str) -> list[str]:
    tokens = text.split(' ') # Split text into tokens

    # If the number of tokens is greater than 256, truncate it
    if len(tokens) > MAX_INPUT_TOKENS:
        tokens = tokens[:MAX_INPUT_TOKENS]

    texts = []

    for i in range(0, len(tokens), MAX_INPUT_TOKENS):
        texts.append(' '.join(tokens[i:i+64]))

    # Join tokens back into text
    return texts

def generate_questions_request(text:str) -> list[str]: # type: ignore
    response = generate_question_pipe(text)

    if response is None:
        return []

    result = []

    for question in response:
        questions = question['generated_text'].split('Question:')[1:] # type: ignore

        for question in questions:
            question = question.strip()
            result.append(question)


    return result

def generate_questions(file):
    if file is None:
        return [''] * (MAX_OUTPUT+1)

    reader = PdfReader(file.name)

    text = ''

    for page in reader.pages:
        text += page.extract_text()

    texts = split_texts(text)

    questions = [text]

    for text in texts:
        questions += generate_questions_request(text)

    i = len(questions)

    while i <= MAX_OUTPUT:
        questions.append('')
        i += 1

    return questions

def generate_answers(context='',q1='', q2='', q3=''):

    answers = []

    for q in [q1, q2, q3]:
        if q == '':
            answers.append('')
            continue

        answer = qa_pipe({
            'question': q,
            'context': context
        })

        answers.append(answer['answer']) # type: ignore

    return answers

with gr.Blocks() as demo:
    gr.Markdown("# PDF to Questions")

    with gr.Row():
        inp = gr.File(label='Select file', file_types=['.pdf'])
        context = gr.Textbox(label='Pdf content', lines=10)

    with gr.Row():
        with gr.Column():
            q1 = gr.Textbox(label='Question 1')
            q2 = gr.Textbox(label='Question 2')
            q3 = gr.Textbox(label='Question 3')

        with gr.Column():
            a1 = gr.Textbox(label='Answer 1')
            a2 = gr.Textbox(label='Answer 2')
            a3 = gr.Textbox(label='Answer 3')

    generate_question_btn = gr.Button('Generate questions')
    generate_answer_btn = gr.Button('Generate answers', variant='primary')

    generate_question_btn.click(fn=generate_questions, inputs=inp, outputs=[context, q1, q2, q3])
    generate_answer_btn.click(fn=generate_answers, inputs=[context, q1, q2, q3], outputs=[a1, a2, a3])

if __name__ == '__main__':
    demo.launch()
