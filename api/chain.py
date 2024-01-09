from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

llm = ChatOpenAI(model='gpt-3.5-turbo-16k')

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
The output not have other words except title.

The title must be have below rules:
- Must be a summary of a specific topic.
- Must be a title.

Question: Generate title of this context
""")

chapter_prompt = ChatPromptTemplate.from_template("""
Answer the following question based only on the provided context.
A chapter must be have below rules:
- Must be a summary of a specific topic.
- Must be a title.
- Must be not a question.
- Dont use uppercase for all words.


<context>
{context}
</context>

The output have multiple lines of title, first page and last page of mainpoint, format:
Title -- First page -- Last page
First page start from 1
Page is index of context

Example:
1. Chapter 1 -- 1 -- 10
2. Chapter 2 -- 11 -- 20
3. Chapter 3 -- 21 -- 30

Question: Generate list of chapter with first page and last page of this context
""")

question_prompt = ChatPromptTemplate.from_template("""
You is a teacher.
You want to make a question for your student based on the provided context.

Questions must be have below rules:
    - Only focus on the context.
    - Must be simple and easy to understand.
    - Must be focus to a problem or theorems.
    - Do not ask a common question.

Answer must be have below rules:
    - Must be simple and shortest as possible.
    - Must be focus to question.

Language of question and answer must is language of context.

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

Question: Generate list of questions for {topic} use content of above context
""")

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

title_chain = title_prompt | llm | output_parser
chapter_chain = chapter_prompt | llm | output_parser
question_chain = question_prompt | llm | output_parser
