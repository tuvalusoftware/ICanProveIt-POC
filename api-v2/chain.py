from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

import env

llm = ChatOpenAI(api_key=env.OPENAI_API_KEY) # TODO: Do not call API in development mode

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

question_prompt = ChatPromptTemplate.from_messages([
    ('system', """
     You will be provided with a chapter content delimited by triple quotes.
     You task is generate a list of question, answers for the content.
     The question should be a problem and can answerable by context.
     The question should be a multiple choice question.
     The output is a list json format only, each question have 3 fields: question, answers, level (easy, medium, hard)
     Answers field is a list of answer, each a answer have 2 fields: answer, is_true (true, false).
     """),
     ('user', '"""{context}"""')
])

output_parser = StrOutputParser()

chain = prompt | llm | output_parser

title_chain = title_prompt | llm | output_parser
question_chain = question_prompt | llm | output_parser
