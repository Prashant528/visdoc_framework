import openai

class OpenAIService:
    def __init__(self, api_key):
        openai.api_key = api_key

    def process_documents(self, system_prompt, user_prompt, documents):
        # prompt = self.build_prompt(system_prompt, user_prompt, documents)
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content

    def build_prompt(self, system_prompt, user_prompt, documents):
        # Combine user and system prompts with the document content
        doc_content = "\n".join(documents)
        return f"{user_prompt}\n\nDocuments:\n{doc_content}"

    def fetch_system_prompt(self):
        return "Act as a helpful assistant."
    
    def fetch_user_prompt(self):
        return "Return a dummy JSON with fields name and address."