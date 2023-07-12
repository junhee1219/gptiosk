var clickTimeout;
var checkTime = 0.001;
var lastMsg ="";
var contents = [];

$(document).ready(function () {
    lastMsg = "직원 : 안녕하세요. Ri카페입니다. 무엇을 도와 드릴까요?"
    $("#chat-messages").append(lastMsg); // 메세지 채팅창에 보이기
  // 엔터키 입력했을때 send-button 클릭이벤트
  $("#message-input").keypress(function (e) {
    if (e.which === 13) {
      $("#send-button").click();
      return false;
    }
  });

  // send-button click 이벤트
  $("#send-button").click(function () {
    var message = $("#message-input").val();
    customerMsg = "나 : " + message;
    if (message.trim() !== "") {
      clearTimeout(clickTimeout); // 클릭 타이머 초기화
      var messageElement = $("<div>").text(customerMsg); // 메세지 채팅창에 보이기
      $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
      $("#message-input").val(""); // 메세지 input창 clear
      clickTimeout = setTimeout(search(message, handleAPIResponse), checkTime * 1000); // checkTime 초동안 입력없으면 API 호출
    }
  });
  //search(lastMsg, handleAPIResponse); // url, data, callback함수
});

function handleAPIResponse(response) {
    if (response.includes("2.")){
        addBadge("", "메뉴선택")
    }
    if (response.includes("2번")){
        addBadge("", "메뉴선택")
    }

    if (response.includes("3.")){
        addBadge("", "사이즈")
    }
    if (response.includes("3번")){
        addBadge("", "사이즈")
    }

    if (response.includes("4.")){
        addBadge("", "결제수단")
    }
    if (response.includes("4번")){
        addBadge("", "결제수단")
    }

    if (response.includes("5.")){
        addBadge("", "테이크아웃여부")
    }
    if (response.includes("5번")){
        addBadge("", "테이크아웃여부")
    }

}

function addBadge(cls, content) {
    if (!contents.includes(content)){
        contents.push(content)
        if (cls == "" || cls == undefined) {
            $(".chat-header").append('<div class="badge">' + content + "</div>");
            } else {
            $("." + cls).append('<div class="badge">' + content + "</div>");
            }
    }    
}

function search(keywords, callback) {

    reqStr = lastMsg + "\n"
    reqStr += "손님 : " + keywords + "\n"
    reqStr += "위 대화는 카페에서 손님과 직원의 대화이다. 손님이 어떤 주제에 대해 말하고 있는지 정답만을 모두 고르시오.\n"
    reqStr += "1. 해당사항 없음\n"
    reqStr += "2. 메뉴선택 (예시 : 아이스 아메리카노. 딸기라떼, 말차프라푸치노)\n"
    reqStr += "3. 사이즈 선택 (예시 : 톨사이즈, 그란데, 벤티, 벤티사이즈 등)\n"
    reqStr += "4. 결제수단 선택 (예시 : 카드, 현금, 카카오페이, 만원, 오천원 등)\n"
    reqStr += "5. 테이크아웃/매장식사 여부 (예시 : 매장식사, 테이크아웃, 먹고감 등)\n"
    
    const API_KEY = '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';
    var config = {
        headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        },
    }

    var messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: reqStr }
    ] 
    var data = {
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        messages: messages,
    }

    axios
    .post('https://api.openai.com/v1/chat/completions', data, config) // POST 요청
    .then(function (response1) {
        console.log(reqStr)
        console.log(response1)
        console.log(response1.data.choices[0].message.content)
        callback(response1.data.choices[0].message.content)
        
        keywords = lastMsg + "\n손님 : " + keywords + "\n";

        let addAsk = "";
        if(contents.indexOf("메뉴선택") == -1){
            addAsk = "메뉴선택";
        }
        if(contents.indexOf("사이즈")== -1){
            addAsk = "사이즈";
        }
        if(contents.indexOf("결제수단")== -1){
            addAsk = "결제수단";
        }
        if(contents.indexOf("테이크아웃여부")== -1){
            addAsk = "테이크아웃여부";
        }
        if (addAsk !== ""){
            keywords += "위는 방금 전 직원과 손님의 대화이다."
            keywords += "너는 직원으로써 "+addAsk + "는 어떻게 할지 손님에게 물어봐라."

            var messages1 = [
                { role: 'system', content: 'you are a cafe clerk. Treat guests kindly.' },
                { role: 'user', content: keywords }
            ]
            var data1= {
                model: 'gpt-3.5-turbo',
                temperature: 0.5,
                messages: messages1,
            } 
            console.log(keywords)
            axios
            .post('https://api.openai.com/v1/chat/completions', data1, config) // POST 요청
            .then(function (response) { // html 본문에 응답(response)의 내용을 넣어줍니다.
                console.log(response.data.choices)
                if (response.data.choices[0].message.content.indexOf("직원") != -1){
                    lastMsg = response.data.choices[0].message.content;
                }
                else{
                    lastMsg = "직원 : "+response.data.choices[0].message.content;
                }
                var index = lastMsg.indexOf("손님 : ");
                if (index !== -1) {
                lastMsg = lastMsg.substring(0, index);
                }

                $("#chat-messages").append(lastMsg); // 메세지 채팅창에 보이기
                })
            .catch(function (error) {
                console.error(error)
                })
        }
        else{
            $("#chat-messages").append("직원 : 주문이 모두 완료되었습니다. 잠시만 기다려주세요!");
        }

        })
    .catch(function (error) {
        console.error(error)
        })


}