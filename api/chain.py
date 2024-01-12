from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

llm = ChatOpenAI()

prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}""")

title_prompt = ChatPromptTemplate.from_messages([
    ('system', """
     You will be provided with a document delimited by triple quotes.
     Your task is to generate a title for the document.
     Provide a title that is a summary of the document.
     The title should be a title, not a question.
     The title should be in the same language as the document.
     The output should be a single line of title.
     """),
    ('user', '"""{context}"""')
])

chapter_prompt = ChatPromptTemplate.from_messages([
    ('system', """
     You will be provided with a document delimited by triple quotes.
     Your task is to generate a list of chapter for the document.
     Provide a chapter that is a summary of the document.
     The chapter should be a title, not a question.
     The chapter should be in the same language as the document.
     The question and answer should be in same language as the chapter.
     The output is a list json format, each chapter have 3 fields: title, first_page, last_page.
     """),
    ('user', '"""{context}"""')
])

question_prompt = ChatPromptTemplate.from_messages([
    ('system', """
     You will be provided with a chapter content delimited by triple quotes.
     You will be provider with a chapter title delimited by tag <title>.
     You task is generate a list of question, answers and index of true answer for the chapter.
     The question should be a problem and can answerable by context.
     The question should be a multiple choice question.
     The output is a list json format, each question have 3 fields: question, answers, true_index.
     Answers field is a list of answer, each a answer have 2 fields: answer, is_true.

     """),
     ('user', '<title>{topic}</title>\n"""{context}"""')
])

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

title_chain = title_prompt | llm | output_parser
chapter_chain = chapter_prompt | llm | output_parser
question_chain = question_prompt | llm | output_parser
