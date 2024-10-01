import openai
from prompts_store import Prompts 
class OpenAIService:
    def __init__(self, api_key):
        openai.api_key = api_key
        self.prompts = Prompts()
        self.model = "gpt-4o-mini"

    def process_documents(self, documents):
        # prompt = self.build_prompt(system_prompt, user_prompt, documents)
        prompt = self.fetch_prompt('PROMPT_FOR_SINGLE_FILE')
        full_prompt = self.add_single_doc_to_prompt(prompt, documents)
        # print(full_prompt)
        response = openai.chat.completions.create(
            model=self.model,
            # messages=[
            #     {"role": "system", "content": system_prompt},
            #     {"role": "user", "content": user_prompt}
            # ]
            messages = full_prompt
        )
        print(response.choices[0].message.content)
        return response.choices[0].message.content

    def add_single_doc_to_prompt(self, prompt, doc):
        prompt_doc = {"role": "user", "content": doc }
        prompt.append(prompt_doc)
        return prompt

    def build_prompt(self, system_prompt, user_prompt, documents):
        # Combine user and system prompts with the document content
        doc_content = "\n".join(documents)
        return f"{user_prompt}\n\nDocuments:\n{doc_content}"

    def fetch_prompt(self, prompt_name):
        return getattr(self.prompts, prompt_name)