$(document).ready(function() {
    $('#message-input').keypress(function(e) {
      if (e.which === 13) { // 13은 엔터 키의 keyCode입니다.
        $('#send-button').click();
        return false; // 폼 전송 방지
      }
    });
  
    $('#send-button').click(function() {
      var message = $('#message-input').val();
      if (message.trim() !== '') {
        var messageElement = $('<div>').text(message);
        $('#chat-messages').append(messageElement);
        $('#message-input').val('');
      }
    });
  });
  