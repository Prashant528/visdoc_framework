
class Prompts:
    SYSTEM_PROMPT = '''
        Act as a helpful assistant.
    '''
    
    USER_PROMPT = '''
        Return a dummy JSON with fields name and address.
    '''

    PROMPT_FOR_SINGLE_FILE = [
        {
            "role": "system", 
            "content": "You are a helpful assistant. You are knowledgeable on Open Source Communities, onboarding processes and, JavaScript and JSON."
        },
        {
            "role": "user", 
            "content": "I have a markdown document that says how to make contribution to an open source project. You may have to parse the markdown. It consists of action steps that may or may not be organized in a paragraph. Can you please extract the major action steps from the document?"
        },
        {
            "role": "assistant",
            "content": "Of course. Do you also want some content of those topics? Do you have any preference on how the content should be generated?"
        },
        {
            "role": "user",
            "content": "Yes, thank you for asking. I would like to get the content too. The content should closely resemble whatever information there is inside the document. I would like you to preserve as much information as you can from the document. Please do not add any extra information."
        },
        {
            "role": "assistant",
            "content": "Ok. Do you have any preference on how should I provide you the information that I extract. Do you want it as plain text or in some other formats like JSON?"
        },
        {
            "role": "user",
            "content": '''Thanks for asking. Actually, I want to create a flowchart of instructions for someone contributing to that open source project. First of all, analyze the action steps that you generate. The action steps can be related to different sequences like making a contribution or setting up the environment or any other sequence. There can be multiple sequences in the flowchart. For each action step given, you have to find the sequence it belongs to and then serially arrange the action steps in a sequence according to the process that a person would follow to carry out the sequence. I want the final output in a JSON format that gives me a source node and the target node for each edge in the flowchart. The format of the JSON should look like { "sequence": "dummy sequence", "edges": [ {"source": "Step 1", "target": "Step 2"}, {"source": "Step 2", "target": "Step 3"} ] }. In summary, group the action steps into distinct sequences and arrange the action steps serially that a person can follow to complete the task in the sequence. If an action step repeats in another sequence, give it a unique key with a number. For example, if the actio step "Making pull requests" appears in another sequence, make it "Making pull requests #2"'''
        },
        {
            "role": "assistant",
            "content": '''Thank you for providing me the format for sequences and action steps. Do you have a preferred format for the content as well?'''
        },
        {
            "role": "user",
            "content": '''After the action steps graph,  give me another JSON, suitable for direct parsing by a JSON parser that maps those exact action steps to their content. The content should sound like instructions for the newcomers on what steps they can take to complete that action step. Each content should contain at least 3 sentences from the document. If there are less than three sentences, merge the action step with other closely related action step and create a new bigger action step. A sample JSON for the summary looks like this { "action step": "content"}. So, your response should contain two JSON objects, 'flow' and 'content' , and nothing else'''
        },
        {
            "role": "assistant",
            "content": '''Ok, I will keep that in mind. Can you please provide me the document? I will make sure that I reply with two JSON objects 'flow' (with the sequences) and 'summary' with the action step contents.'''
        },
    ]
