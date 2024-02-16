import requests

clientId = 'em8qfjub2u'
clientSecret = '3Q9eckDxyIrMnGG91o3crafGGhIfAU7VZNJu71Ke'

def stt(filePath):
    # language => 언어 코드 (Kor, Jpn, Eng, Chn)
    language = 'Kor'
    url = f'https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang={language}'
    headers = {
        'Content-Type': 'application/octet-stream',
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
    }

    with open(filePath, 'rb') as audio_file:
        response = requests.post(url, headers=headers, data=audio_file)

    print(response.status_code)
    print(response.json())
print("시작")
stt("test.m4a")
# import pyaudio
# import numpy as np
# import wave
# import time

# # 파라미터 설정
# FORMAT = pyaudio.paInt16
# CHANNELS = 1
# RATE = 44100
# CHUNK = 1024
# THRESHOLD_UPPER = 80  # 감지할 소리 크기 임계값
# THRESHOLD_LOWER = 100  # 소리가 낮아질 때의 임계값
# BUFFER_DURATION = 1  # seconds

# buffer_frames = int(RATE / CHUNK * BUFFER_DURATION)
# audio_buffer = []

# def rms(data):
#     shorts = np.frombuffer(data, dtype=np.int16)
#     sum_squares = 1.0 * np.sum(shorts ** 2)
#     return np.sqrt(sum_squares / len(shorts))

# audio = pyaudio.PyAudio()

# # 스트리밍 시작
# stream = audio.open(format=FORMAT, channels=CHANNELS,
#                     rate=RATE, input=True,
#                     frames_per_buffer=CHUNK)

# print("녹음 시작...")

# recording = False
# silence_count = 0
# frames = []
# filename = "output.wav"
# try:
#     while True:
#         data = stream.read(CHUNK)
#         current_rms = rms(data)
        
#         if not recording:
#             audio_buffer.append(data)
#             if len(audio_buffer) > buffer_frames:
#                 audio_buffer.pop(0)
            
#             if current_rms > THRESHOLD_UPPER:
#                 print(current_rms)
#                 recording = True
#                 frames.extend(audio_buffer)  # buffer 저장
#                 audio_buffer.clear()
#                 print("녹음 중...")

#         else:
#             frames.append(data)
#             if current_rms < THRESHOLD_LOWER:
#                 silence_count += 1
#                 if silence_count > int(RATE / CHUNK * 3):  # 3초 동안 지속
#                     print("녹음 종료 및 저장...")
#                     with wave.open(filename, 'wb') as wf:
#                         wf.setnchannels(CHANNELS)
#                         wf.setsampwidth(audio.get_sample_size(FORMAT))
#                         wf.setframerate(RATE)
#                         wf.writeframes(b''.join(frames))
#                         stt(filename)
#                     break

#             else:
#                 silence_count = 0

# except KeyboardInterrupt:
#     print("녹음 중지")

# # 스트리밍 정지
# stream.stop_stream()
# stream.close()
# audio.terminate()
