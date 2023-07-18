var clickTimeout;
var checkTime = 0.001;
var contents = [];
var recentStaff = '';
var recentCustomer = '';
let menuData;
var xhr = new XMLHttpRequest();
var menuList;

let API_KEY = "sk-wzWR5Z";
API_KEY += "bfFqw1CT7";
API_KEY += "gdKBOT3BlbkFJo";
API_KEY += "VSYTnt9wDHA3vDHgU4v";
var config = {
    headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    },
};

const checkString = (str, listdata) => {
    for (let i = 0; i < listdata.length; i++) {
        if (str.includes(listdata[i])) {
            return listdata[i];
        }
    }
    return false;
};

xhr.open("GET", "data.json", true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        menuData = JSON.parse(xhr.responseText);
        menuList = menuData.menu.map(item => item.name);
    }
};
xhr.send();




$(document).ready(function () {
    $("#reset-button").click(function () {
        $("#chat-messages").empty();
        $(".chat-header").empty();
        $(".chat-header").append("Chat");
        contents = [];
        recentStaff = "직원 : 안녕하세요. Ri카페입니다. 무엇을 도와 드릴까요?";
        recentCustomer = '';
        $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
    });

    recentStaff = "직원 : 안녕하세요. Ri카페입니다. 무엇을 도와 드릴까요?";
    $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
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
        customerMsgForView = "나 : " + message;
        recentCustomer += "손님 : " + message + "\n";
        if (message.trim() !== "") {
            clearTimeout(clickTimeout); // 클릭 타이머 초기화
            var messageElement = $("<div>").text(customerMsgForView); // 메세지 채팅창에 보이기
            $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
            $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            $("#message-input").val(""); // 메세지 input창 clear
            clickTimeout = setTimeout(
                search(),
                checkTime * 1000
            ); // checkTime 초동안 입력없으면 API 호출
        }
    });
    //search(lastMsg, handleAPIResponse); // url, data, callback함수
});

function handleAPIResponse(response) {
    var question = recentStaff + "\n" + recentCustomer;
    if (response.includes("ㄴ")) {
        question += "\n위 대화를 보고 다음 보기 중 손님이 고른 메뉴를 고르시오\n";
        question += JSON.stringify(menuList);
        question += "\n answer : "
        console.log(question)
        deciMenu = checkString(getGpt(question), menuList)
        console.log(deciMenu);
        if (deciMenu != false){
            addBadge("", "메뉴선택 : "+deciMenu);
        }
        
    }

    if (response.includes("ㄷ")) {
        addBadge("", "사이즈");
    }

    if (response.includes("ㄹ")) {
        addBadge("", "결제수단");
    }

    if (response.includes("ㅁ")) {
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


function getGpt(keyword) {
    var messages = [
        {
            role: "system",
            content: "Act as a person who chooses the correct answer",
        },
        { role: "user", content: keyword },
    ];
    var data = {
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: messages,
    };

    axios
        .post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
        .then(function (response) {
            result = response.data.choices[0].message.content
            console.log(result);
            return result;
        })
        .catch(function (error) {
            console.error(error);
        });
}

function search() {
    reqStr =
        "ㄱ. N/A\n";
    reqStr +=
        "ㄴ. Menu decision (e.g. Iced Americano, Strawberry Latte, Matcha Frappuccino, Cheesecake, etc.)\n";
    reqStr +=
        "ㄷ. Size decision (e.g. Tall, Tall size, Grande, Venti, Venti size, etc.)\n";
    reqStr +=
        "ㄹ. Decide payment method (e.g. card, cash, Kakao Pay, 10,000 won, 5,000 won, etc.)\n";
    reqStr +=
        "ㅁ. Decide for here or to go (e.g. to go, for here, eat-in, etc.)\n";
    reqStr +=
        "ㅂ. Ask or request to the Staff (e.g. Can you recommend a menu?, what size do you have?, what menus can I order?, What time is it open here, etc.)\n";
    reqStr +=
        "The conversation below is a conversation between a customer and an employee at a cafe. \n";
    reqStr +=
        "Choose all the correct answers from the above choices to indicate what the customer decided.\n";
    reqStr +=
        "Answer ㄱ or ㅂ if customer simply asked something or just told on a related topic.\n";
    reqStr += "Don't say anything about irrelevant things.\n";
    reqStr += "======== 대화내용 =========\n";
    reqStr += recentStaff + "\n";
    reqStr += recentCustomer;
    reqStr += "===========================\n";
    reqStr += "Answer : ";

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
        .then(function (response) {
            console.log(reqStr);
            console.log(response.data.choices[0].message.content);
            handleAPIResponse(response.data.choices[0].message.content);
            StaffRespond();
        })
        .catch(function (error) {
            console.error(error);
        });
}

function StaffRespond() {

    keywords = recentStaff + "\n" + recentCustomer;
    let nextAskContent = "";
    if (contents.indexOf("메뉴선택") == -1) {
        nextAskContent = "메뉴선택";
    }
    else if (contents.indexOf("사이즈") == -1) {
        nextAskContent = "사이즈";
    }
    else if (contents.indexOf("테이크아웃여부") == -1) {
        nextAskContent = "테이크아웃여부";
    }
    else if (contents.indexOf("결제수단") == -1) {
        nextAskContent = "결제수단";
    }

    if (nextAskContent !== "") {
        keywords += "The above is just a conversation between a cafe Staff and a customer.";
        keywords += "You should be a kind staff. And ask about" + nextAskContent + "to Customer by the language requested by the Customer.\n";
        keywords += "직원 : "
        var messages = [
            {
                role: "system",
                content: "you are a cafe Staff. Treat guests kindly.",
            },
            { role: "user", content: keywords },
        ];
        var data = {
            model: "gpt-3.5-turbo",
            temperature: 0.5,
            messages: messages,
        };
        console.log(keywords);
        axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {
                console.log(response.data.choices[0].message.content);
                if (
                    response.data.choices[0].message.content.indexOf("직원") != -1
                ) {
                    recentStaff = response.data.choices[0].message.content;
                } else {
                    recentStaff = "직원 : " + response.data.choices[0].message.content;
                }
                var index1 = recentStaff.indexOf("손님 :");
                var index2 = recentStaff.indexOf("손님:");
                if (index1 !== -1) {
                    recentStaff = recentStaff.substring(0, index1);
                }
                if (index2 !== -1) {
                    recentStaff = recentStaff.substring(0, index2);
                }
                $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
                $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            })
            .catch(function (error) {
                console.error(error);
            });
    } else {
        recentStaff = "직원 : 주문이 모두 완료되었습니다. 잠시만 기다려주세요!";
        $("#chat-messages").append(recentStaff);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    }
}