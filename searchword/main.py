import openai
import json


# 항상 같은 날씨를 리턴하는 예시용 더미 함수이다. 
# 실제 개발환경에서는 상황에 맞는 코드를 구현해야한다.
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    weather_info = {
        "location": location,
        "temperature": "72",
        "unit": unit,
        "forecast": ["sunny", "windy"],
    }
    return json.dumps(weather_info)


def run_conversation():
    # Step 1: chatgpt에게 질문과 이용할 수 있는 함수 목록을 전달한다. 
    messages = [{"role": "사용자", "content": "서울 날씨는 어때? "}]
    functions = [
        {
            "name": "get_current_weather",
            "description": "위치를 전달하면, 현재 날씨를 알려준다",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "구군시  전달한다. ex. 서울특별시",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        }
    ]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages,
        functions=functions, # 이 곳에서 함수 정보를 전달한다.
        function_call="auto",  
    )
    response_message = response["choices"][0]["message"]

    # Step 2: GPT에서 함수 호출을 하라고 했는지 확인하기 
    if response_message.get("function_call"):
        # Step 3: GPT에서 호출하라고 한 함수를 실제로 호출하기 
        available_functions = {
            "get_current_weather": get_current_weather,
        }  # 이 예제에서는 호출할 수 있는 함수를 1개만 두었지만, 실제로는 여러개를 추가할 수 있다. 
        function_name = response_message["function_call"]["name"] 
        fuction_to_call = available_functions[function_name]
        function_args = json.loads(response_message["function_call"]["arguments"])
        function_response = fuction_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        ) # GPT가 제안한 함수를 GPT에서 찾은 매개변수로 전달하기 

        # Step 4: 함수 호출로 얻은 결과를 gpt에게 다시 보내주기 send the info on the function call and function response to GPT
        messages.append(response_message)  # API으로 호출받은 값을 확장하기 
        messages.append(
            {
                "role": "function",
                "name": function_name,
                "content": function_response,
            }
        ) 
        second_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
        )  # gpt에게 응답 결과 다시 전달하기 
        return second_response


print(run_conversation())
