from flask import Blueprint, request, jsonify
from .github_service import GitHubService
from .openai_service import OpenAIService
from .config import Config

api = Blueprint('api', __name__)

github_service = GitHubService(Config.GITHUB_TOKEN)
openai_service = OpenAIService(Config.OPENAI_API_KEY)

@api.route('/fetch_and_analyze', methods=['POST'])
def fetch_and_analyze():
    data = request.json
    repo = data.get('repo')
    file_path = data.get('file_path')
    system_prompt = data.get('system_prompt')
    user_prompt = data.get('user_prompt')

    if not repo or not file_path or not system_prompt or not user_prompt:
        return jsonify({"error": "Missing required parameters"}), 400

    # Download contributing.md and related files
    documents = github_service.download_recursive(repo, file_path)

    # Send the documents to OpenAI for processing
    result = openai_service.process_documents(system_prompt, user_prompt, documents)
    return jsonify({"result": result})
