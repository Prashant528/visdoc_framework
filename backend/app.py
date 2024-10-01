from flask import Flask, request, jsonify
from github_service import GitHubService
from openai_service import OpenAIService
from config import Config
from utils import parse_openai_single_json, parse_github_link

# Create Flask app
app = Flask(__name__)

# Initialize services
github_service = GitHubService(Config.GITHUB_TOKEN)
openai_service = OpenAIService(Config.OPENAI_API_KEY)


@app.route('/', methods=['GET'])
def print_hello():
    print("Hello")
    return "<p>Hello</p>"

@app.route('/fetch_and_analyze', methods=['POST'])
def fetch_and_analyze():
    data = request.json
    # owner = data.get('owner')
    # repo = data.get('repo')
    # file_path = data.get('file_path')
    repo_link = data.get('link')
    owner, repo, file_path = parse_github_link(repo_link)

    print("Owner:", owner, "REpo: ", repo, "File: ", file_path)
    if not owner or not repo or not file_path:
        return jsonify({"error": "The link has missing requirements."}), 400

    # Download contributing.md and related files PTANDAN(remove the below comment)
    documents = github_service.download_recursive(owner, repo, file_path)

    # Send the documents to OpenAI for processing
    open_ai_response = openai_service.process_documents(documents)
    response= parse_openai_single_json(open_ai_response)

    return jsonify(response)



if __name__ == '__main__':
    app.run(debug=True, port=8080)
