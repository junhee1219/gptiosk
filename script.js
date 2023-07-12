var clickTimeout;
var checkTime = 0.001;
var lastMsg = "";
var contents = [];

$(document).ready(function () {
  $("#reset-button").click(function () {
    $("#chat-messages").empty();
    $(".chat-header").empty();
    $(".chat-header").append("Chat");
    contents = [];
    lastMsg = "직원 : 안녕하세요. Ri카페입니다. 무엇을 도와 드릴까요?";
    $("#chat-messages").append(lastMsg); // 메세지 채팅창에 보이기
  });

  lastMsg = "직원 : 안녕하세요. Ri카페입니다. 무엇을 도와 드릴까요?";
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
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
      $("#message-input").val(""); // 메세지 input창 clear
      clickTimeout = setTimeout(
        search(message, handleAPIResponse),
        checkTime * 1000
      ); // checkTime 초동안 입력없으면 API 호출
    }
  });
  //search(lastMsg, handleAPIResponse); // url, data, callback함수
});

function handleAPIResponse(response) {
  if (response.includes("B")) {
    addBadge("", "메뉴선택");
  }

  if (response.includes("C")) {
    addBadge("", "사이즈");
  }

  if (response.includes("D")) {
    addBadge("", "결제수단");
  }

  if (response.includes("E")) {
    addBadge("", "테이크아웃여부");
  }
}

function addBadge(cls, content) {
  if (!contents.includes(content)) {
    contents.push(content);
    if (cls == "" || cls == undefined) {
      $(".chat-header").append('<div class="badge">' + content + "</div>");
    } else {
      $("." + cls).append('<div class="badge">' + content + "</div>");
    }
  }
}

function search(keywords, callback) {
    API_KEY = "sk-wzWR5Z";
    API_KEY += "bfFqw1CT7";
    API_KEY += "gdKBOT3BlbkFJo";
    API_KEY += "VSYTnt9wDHA3vDHgU4v";

    reqStr = "A N/A\n";
    reqStr += "B menu confirmed (Example: Iced Americano, Strawberry Latte, Matcha Frappuccino, Cheesecake, etc.)\n";
    reqStr += "C size confirmed (Example: Tall, Tall size, Grande, Venti, Venti size, etc.)\n";
    reqStr += "D Payment method confirmation (Example: card, cash, Kakao Pay, 10,000 won, 5,000 won, etc.)\n";
    reqStr +="F Questions or requests to the clerk (e.g.: Can you recommend a menu?, what size do you have?, What time is it open here, etc.)\n";
    reqStr += "The conversation below is a conversation between a customer and an employee at a cafe. \n";
    reqStr += "Choose all the correct answers from the examples above to indicate what the customer intended.\n";
    reqStr += "Answer A or F for simple queries or just speaking on a related topic.\n";
    reqStr += "Don't say anything about irrelevant things.\n";
    reqStr += "======== 대화내용 =========\n";
    reqStr += lastMsg + "\n";
    reqStr += "손님 : " + keywords + "\n";
    reqStr += "===========================\n";
    reqStr += "answer : ";


  var config = {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  var messages = [
    {
      role: "system",
      content: "Act as a person who chooses the correct answer",
    },
    { role: "user", content: reqStr },
  ];
  var data = {
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    messages: messages,
  };

  axios
    .post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
    .then(function (response1) {
      console.log(reqStr);
      console.log(response1.data.choices[0].message.content);
      callback(response1.data.choices[0].message.content);

      keywords = lastMsg + "\n손님 : " + keywords + "\n";

      let addAsk = "";

      if (contents.indexOf("테이크아웃여부") == -1) {
        addAsk = "테이크아웃여부";
      }
      if (contents.indexOf("결제수단") == -1) {
        addAsk = "결제수단";
      }
      if (contents.indexOf("사이즈") == -1) {
        addAsk = "사이즈";
      }
      if (contents.indexOf("메뉴선택") == -1) {
        addAsk = "메뉴선택";
      }
      if (addAsk !== "") {
        keywords += "위는 방금 전 직원과 손님의 대화이다.";
        keywords +=
          "너는 직원으로써 " +
          addAsk +
          "에 관해 어떻게 할지 손님에게 물어봐라.";

        var messages1 = [
          {
            role: "system",
            content: "you are a cafe clerk. Treat guests kindly.",
          },
          { role: "user", content: keywords },
        ];
        var data1 = {
          model: "gpt-3.5-turbo",
          temperature: 0.5,
          messages: messages1,
        };
        console.log(keywords);
        axios
          .post("https://api.openai.com/v1/chat/completions", data1, config) // POST 요청
          .then(function (response) {
            // html 본문에 응답(response)의 내용을 넣어줍니다.
            console.log(response.data.choices);
            if (
              response.data.choices[0].message.content.indexOf("직원") != -1
            ) {
              lastMsg = response.data.choices[0].message.content;
            } else {
              lastMsg = "직원 : " + response.data.choices[0].message.content;
            }
            var index1 = lastMsg.indexOf("손님 :");
            var index2 = lastMsg.indexOf("손님:");
            if (index1 !== -1) {
              lastMsg = lastMsg.substring(0, index1);
            }
            if (index2 !== -1) {
              lastMsg = lastMsg.substring(0, index2);
            }
            $("#chat-messages").append(lastMsg); // 메세지 채팅창에 보이기
            $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
          })
          .catch(function (error) {
            console.error(error);
          });
      } else {
        $("#chat-messages").append(
          "직원 : 주문이 모두 완료되었습니다. 잠시만 기다려주세요!"
        );
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
}
