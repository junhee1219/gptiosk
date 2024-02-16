import json
import openai
import requests
from tenacity import retry, wait_random_exponential, stop_after_attempt
from termcolor import colored

#GPT_MODEL = "gpt-4-1106-preview"
GPT_MODEL = "gpt-4-1106-preview"


@retry(wait=wait_random_exponential(multiplier=1, max=40), stop=stop_after_attempt(3))
def chat_completion_request(messages, tools=None, tool_choice=None, model=GPT_MODEL):
    openai.api_key = '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'
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openai.api_key,
    }
    json_data = {"model": model, "messages": messages}
    if tools is not None:
        json_data.update({"tools": tools})
    if tool_choice is not None:
        json_data.update({"tool_choice": tool_choice})
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=json_data,
        )
        return response
    except Exception as e:
        print("Unable to generate ChatCompletion response")
        print(f"Exception: {e}")
        return e

tools = [
    {
        "type": "function",
        "function": {
            "name": "fn_set_class",
            "description": "set the class in '브랜드', '품목', '상품명', '특성', '기타'",
            "parameters": {
                "type": "object",
                "properties": {
                    "class_name": {
                        "type": "string",
                        "description": "proper class in '브랜드', '품목', '상품명', '특성', '기타'",
                    },
                },
                "required": ["class_name"],
            },
        }
    },
]

while True:
    messages = []
    word = input("단어 : ")
    messages.append({"role": "system", "content": "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous."})
    messages.append({"role": "user", "content": "Please classify the input word into the most appropriate category among Brand, Item, Feature, or Product Name.\nINPUT : "})
    messages.append({"role": "user", "content": word})
    chat_response = chat_completion_request(
        messages, tools=tools, tool_choice={"type": "function", "function": {"name": "fn_set_class"}}
    )
    chat_response.json()["choices"][0]["message"]
    #chat_response.json()
    #print(chat_response.json())
    print(json.loads(chat_response.json()["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"])["class_name"])