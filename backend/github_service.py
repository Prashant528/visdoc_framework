import requests
from urllib.parse import urljoin

class GitHubService:
    def __init__(self, token):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def get_file_content(self, repo, path):
        url = f"{self.base_url}/repos/{repo}/contents/{path}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            content = response.json()
            if content['type'] == 'file':
                return requests.get(content['download_url']).text
        return None

    def extract_links(self, content):
        # Extract links to .md files and GitHub wiki pages from content
        # (Using regex or markdown parsing libraries)
        pass

    def download_recursive(self, repo, file_path, depth=0):
        if depth > 5:  # To avoid infinite recursion
            return
        
        content = self.get_file_content(repo, file_path)
        if not content:
            return
        
        links = self.extract_links(content)
        for link in links:
            if link.endswith('.md') or 'wiki' in link:
                new_file_path = self.convert_to_file_path(link, repo)
                self.download_recursive(repo, new_file_path, depth + 1)

    def convert_to_file_path(self, link, repo):
        # Convert GitHub links to file paths (to handle relative paths)
        pass
