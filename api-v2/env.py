from dotenv import load_dotenv
import os

load_dotenv()

PRODUCT_ENV = os.getenv('PRODUCT_ENV') == 'true'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') if PRODUCT_ENV else 'sk-fake-key-xxx'
