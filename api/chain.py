from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

llm = ChatOpenAI()

prompt = ChatPromptTemplate.from_messages([
    ('user', '{input}')
])

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

