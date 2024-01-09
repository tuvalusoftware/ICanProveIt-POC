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

title_prompt = ChatPromptTemplate.from_template("""
Answer the following question based only on the provided context:

<context>
{context}
</context>

The output only single line of text.
The output not have other characters except the title.

Question: Generate title of this context
""")

chapter_prompt = ChatPromptTemplate.from_template("""
Answer the following question based only on the provided context:

<context>
{context}
</context>

The output have multiple lines of title, first page and last page of mainpoint, format:
Title -- First page -- Last page

Example:
1. Chapter 1 -- 1 -- 10
2. Chapter 2 -- 11 -- 20
3. Chapter 3 -- 21 -- 30

Question: Generate list of main points with first page and last page of this context
""")

question_prompt = ChatPromptTemplate.from_template("""
Answer the following question based only on the provided context:

<context>
{context}
</context>

The output have multiple lines of question and answer, format:
q: question
a: answer

Example:
q: Content of question 1
a: Answer of question 1

q: Content of question 2
a: Answer of question 2

q: Content of question 3
a: Answer of question 3

Question: Generate questions and answer of this context
""")

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

title_chain = title_prompt | llm | output_parser
chapter_chain = chapter_prompt | llm | output_parser
question_chain = question_prompt | llm | output_parser
