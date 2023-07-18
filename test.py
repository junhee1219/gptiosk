import json

# JSON 파일 열기 (UTF-8 인코딩)
with open('data.json', encoding='utf-8') as file:
    data = json.load(file)

# 데이터 사용하기

my_list = data["menu"]
name_list = [item["name"] for item in my_list]
print(name_list)


