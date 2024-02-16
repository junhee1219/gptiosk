const fs = require('fs');
const axios = require('axios'); // 'request' 모듈 대신 'axios'를 사용합니다.

const clientId = 'em8qfjub2u';
const clientSecret = '3Q9eckDxyIrMnGG91o3crafGGhIfAU7VZNJu71Ke';
let mediaRecorder;
let audioChunks = [];

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const downloadLink = document.getElementById('downloadLink');
                downloadLink.href = audioUrl;
                downloadLink.download = 'recorded_audio.wav';
            };

            mediaRecorder.start();
        })
        .catch(error => {
            console.error("Error accessing the microphone:", error);
        });
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
}


// language => 언어 코드 (Kor, Jpn, Eng, Chn)
async function stt(language, filePath) { // 비동기 함수로 변경
    const url = `https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=${language}`;
    const headers = {
        'Content-Type': 'application/octet-stream',
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
    };

    try {
        const response = await axios.post(url, fs.createReadStream(filePath), { headers });
        console.log(response.status);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

stt('Kor', '아메리카노한잔.m4a');
