import re

def extract_md_links(content):
    # Extract Markdown links using regex
    md_links = re.findall(r'\[.*?\]\((.*?)\)', content)
    return md_links

def is_md_or_wiki(link):
    return link.endswith('.md') or 'wiki' in link
