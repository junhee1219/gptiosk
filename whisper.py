import openai
api_key = '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'
client = openai.OpenAI(api_key=api_key)

audio_file_path = "./whisper/회의록.m4a"
audio_file = open(audio_file_path, "rb")
response = client.audio.transcriptions.create(model="whisper-1",file= audio_file)

# 결과 출력
print(response)
print(type(response))


# from pathlib import Path

# text = '''\n\n영화 서울의 봄이 개봉 20일 만에 관객 700만 명을 돌파하며 천만 영화 달성 기대 
# 감이 높은데요. 최근 한 영화관 직원이 익명 게시판에 제발 영화 보러 오지 마세요 라며 고충을 털어놔 
# 화제입니다. 글쓴이 A씨는 서울의 봄이 대박 나서 사람들이 어마어마하게 많은데 상영관은 더럽고 매점 
# 에서 주문하면 오래 기다리셨을 거라며 글을 시작했습니다. A씨는 그 이유가 작년 대비 인건비가 반으로
#  줄어 직원이 없기 때문이라고 주장했습니다. 예전에는 장사가 잘 되면 알바생도 많아지고 처우가 좋아 
# 서 기뻤지만 지금은 장사가 잘 되면 나만 힘드니 그냥 안 왔으면 좋겠다고 했는데요. 회사에선 1시간 휴
# 식하라고 하는데 직원이 1시간 쉬면 알바생 혼자 매점과 상영관 퇴출 업무를 다 해야 한다며 그래서 밥 
# 도 못 먹고 9시간 내내 서 있다가 겨우 집에 간다고 말했습니다. 그러면서 제발 저희 좀 살려달라 근처 
# 다른 영화관으로 가세요라고 부탁했습니다. 업계에 따르면 코로나 팬데믹으로 관객이 크게 줄면서 상영 
# 관 매출이 급감해 인력이 줄었고 이에 다시 폭증한 관객 대응에 어려움을 겪는 걸로 전해졌습니다.
# )'''

# speech_file_path = Path(__file__).parent / "speech.mp3"
# response = client.audio.speech.create(
#   model="tts-1",
#   voice="alloy",
#   input=text)

# response.stream_to_file(speech_file_path)


# # from pytube import YouTube
# # DOWNLOAD_FOLDER = "./whisper"
# # url = "https://www.youtube.com/watch?v=h1doWqX6csU"
# # yt = YouTube(url)
# # stream = yt.streams.get_highest_resolution()
# # stream.download(DOWNLOAD_FOLDER)

# # from moviepy.editor import VideoFileClip
# # video_file_path = "./whisper/video.mp4"
# # video = VideoFileClip(video_file_path)
# # audio_file_path = "./whisper/audio.mp3"
# # video.audio.write_audiofile(audio_file_path)