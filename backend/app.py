from flask import Flask, request, jsonify
from github_service import GitHubService
from openai_service import OpenAIService
from config import Config

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
    repo = data.get('repo')
    file_path = data.get('file_path')

    if not repo or not file_path:
        return jsonify({"error": "Missing required parameters"}), 400
    
    print(data)
    print(Config.GITHUB_TOKEN)
    print(Config.OPENAI_API_KEY)

    return f"<p>{data}</p>"
    # # Download contributing.md and related files
    # documents = github_service.download_recursive(repo, file_path)

    # # Send the documents to OpenAI for processing
    # result = openai_service.process_documents(system_prompt, user_prompt, documents)
    # return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True, port=8080)
