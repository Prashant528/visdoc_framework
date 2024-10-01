import re
import json

def extract_md_links(content):
    # Extract Markdown links using regex
    md_links = re.findall(r'\[.*?\]\((.*?)\)', content)
    return md_links

def is_md_or_wiki(link):
    return link.endswith('.md') or 'wiki' in link

def parse_github_link(link):
    
    # Split the path into components
    path_parts = link.split('/')
    
    # Extract the repo owner, repo name, and file name
    repo_owner = path_parts[3]
    repo_name = path_parts[4]
    file_name = path_parts[-1]
    
    return repo_owner, repo_name, file_name

def parse_openai_single_json(json_reply):
    pattern = r'{(.*)}'
    # re.DOTALL allows the '.' to match newlines as well
    actual_json = re.search(pattern, json_reply, re.DOTALL)
    json_string = '{' + actual_json.group(1) + '}'
    response_dict = json.loads(json_string)
    return response_dict

def parse_openai_separate_json(json_reply):
    #Parse the string to get JSON only
    splitted_json = json_reply.split('```')
    flow = splitted_json[1]
    summaries = splitted_json[-2]

    for json in splitted_json:
        print("\n\nOBJECT :\n\n", json)
    pattern = r'{(.*)}'
    # re.DOTALL allows the '.' to match newlines as well
    actual_json_flow = re.search(pattern, flow, re.DOTALL)
    flow_json_string = '{' + actual_json_flow.group(1) + '}'

    actual_json_summaries = re.search(pattern, summaries, re.DOTALL)
    summaries_json_string = '{' + actual_json_summaries.group(1) + '}'

    # Convert JSON string into a Python dictionary
    flow_response_dict = json.loads(flow_json_string)
    summaries_response_dict = json.loads(summaries_json_string)

    # print(summaries_response_dict)
    # print(flow_response_dict['flow'])

    return (flow_response_dict, summaries_response_dict)