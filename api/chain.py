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
     The output have multiple lines of chapter, format:
     order. Title -- first page -- last page (page start from 1, page is index of document)

     Example:
     1. Chapter 1 -- 1 -- 10
     2. Chapter 2 -- 11 -- 20
     3. Chapter 3 -- 21 -- 30
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
     The answer should be a list of answer have more than 2 answer, delimited by comma.

     The output have multiple lines of question and answer, format:
     q: Question?
     a: Answer 1, Answer 2, Answer 3, Answer 4
     t: Index of true answer (index of answer, start from 0)

     Example:
     q: Content of question 1?
     a: Answer 1, Answer 2, Answer 3
     t: 1

     q: Content of question 2?
     a: Answer 1, Answer 2, Answer 3
     t: 2

     q: Content of question 3?
     a: Answer 1, Answer 2, Answer 3
     t: 0

     Explanation:
     Question 1: Answer 2 is the true answer
     Question 2: Answer 3 is the true answer
     Question 3: Answer 1 is the true answer
     """),
     ('user', '<title>{topic}</title>\n"""{context}"""')
])

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

title_chain = title_prompt | llm | output_parser
chapter_chain = chapter_prompt | llm | output_parser
question_chain = question_prompt | llm | output_parser
