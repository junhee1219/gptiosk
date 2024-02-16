import spacy

# spaCy의 영어 모델 로드
nlp = spacy.load("en_core_web_sm")

# 사용자로부터 입력 받기
text = input("Enter your text: ")

# 텍스트를 NLP 파이프라인에 통과시키기
doc = nlp(text)

# 토큰화된 단어와 품사 태깅 출력
for token in doc:
    print(f"{token.text} ({token.pos_})")

# 개체명 인식 결과 출력
for ent in doc.ents:
    print(f"{ent.text} ({ent.label_})")
