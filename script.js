var clickTimeout;
var checkTime = 2;

$(document).ready(function () {
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
    message = "나 : " + message;
    if (message.trim() !== "") {
      clearTimeout(clickTimeout); // 클릭 타이머 초기화
      var messageElement = $("<div>").text(message); // 메세지 채팅창에 보이기
      $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
      $("#message-input").val(""); // 메세지 input창 clear
      clickTimeout = setTimeout(sendDataToAPI, checkTime * 1000); // checkTime 초동안 입력없으면 API 호출
    }
  });
  sendDataToAPI("http://example.com/api", { key: "value" }, handleAPIResponse); // url, data, callback함수
});

function sendDataToAPI(url, data, callback) {
  $.ajax({
    url: url,
    method: "POST",
    data: data,
    success: function (response) {
      callback(response);
    },
    error: function (error) {
      callback(error);
    },
  });
}

function handleAPIResponse(response) {
  console.log("API 응답:", response);
}

function addBadge(cls, content) {
  if (cls == "" || cls == undefined) {
    $(".chat-header").append('<div class="badge">' + content + "</div>");
  } else {
    $("." + cls).append('<div class="badge">' + content + "</div>");
  }
}
