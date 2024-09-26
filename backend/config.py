import os

class Config:
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

