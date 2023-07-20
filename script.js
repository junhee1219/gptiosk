var clickTimeout;
var checkTime = 0.001;
var contents = [];
var recentStaff = '';
var recentCustomer = '';
let menuData;
var xhr = new XMLHttpRequest();
var menuList;
var askContent;

// @TODO : chatgpt와 통신중인거 state 나타내는 div요소 하나 만들고(색깔 등)
// 그사이에 채팅친거는 messages에 append해서 저장해놨다가 gpt에던지기

var reqStr = "ㄱ. N/A\n";
reqStr += "ㄴ. Menu decision (e.g. Iced Americano, Strawberry Latte, Matcha Frappuccino, Cheesecake, etc.)\n";
reqStr += "ㄷ. Size decision (e.g. Tall, Tall size, Grande, Venti, Venti size, etc.)\n";
reqStr += "ㄹ. Decide payment method (e.g. card, cash, Kakao Pay, 10,000 won, 5,000 won, etc.)\n";
reqStr += "ㅁ. Decide for here or to go (e.g. to go, for here, eat-in, etc.)\n";
reqStr += "ㅂ. Ask or request to the Staff (e.g. Can you recommend a menu?, what size do you have?, what menus can I order?, What time is it open here, etc.)\n";
reqStr += "The conversation below is a conversation between a customer and an employee at a cafe. \n";
reqStr += "Choose all the correct answers from the above choices to indicate what the customer decided.\n";
reqStr += "Answer ㄱ or ㅂ if customer simply asked something or just told on a related topic.\n";
reqStr += "Don't say anything about irrelevant things.\n";

let API_KEY = "sk-wzWR5Z";
API_KEY += "bfFqw1CT7";
API_KEY += "gdKBOT3BlbkFJo";
API_KEY += "VSYTnt9wDHA3vDHgU4v";
var config = { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", }, };
var data = { model: "gpt-3.5-turbo", temperature: 0.5, messages: '' };

const setData = (messages) => { data.messages = messages; }

const checkString = (str, listdata) => {
    console.log(str, listdata)
    var result = [];
    for (let i = 0; i < listdata.length; i++) {
        if (str.includes(listdata[i])) {
            result.push(listdata[i]);
        }
    }
    return result;
};

xhr.open("GET", "data.json", true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        menuData = JSON.parse(xhr.responseText);
        menuList = menuData.menu.map(item => item.name);
    }
};
xhr.send();
const initPage = () => {
    $("#chat-messages").empty();
    $(".chat-header").empty();
    $(".chat-header").append("Chat");
    contents = [];
    recentStaff = "직원 : 안녕하세요. RI카페입니다. 무엇을 도와 드릴까요?";
    recentCustomer = '';
    $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
}

$("#reset-button").click(function () {
    initPage();
});
$("#message-input").keypress(function (e) {
    if (e.which === 13) {
        $("#send-button").click();
        return false;
    }
});
$("#send-button").click(function () {
    var message = $("#message-input").val();
    customerMsgForView = "나 : " + message;
    recentCustomer += "손님 : " + message;
    if (message.trim() !== "") {
        clearTimeout(clickTimeout); // 클릭 타이머 초기화
        var messageElement = $("<div>").text(customerMsgForView); // 메세지 채팅창에 보이기
        $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        $("#message-input").val(""); // 메세지 input창 clear
        clickTimeout = setTimeout(search(), checkTime * 1); // checkTime 초동안 입력없으면 API 호출
    }
});
$(document).ready(function () {
    initPage();
});

const trimResponse = (response) => {
    var result;
    var textMsg = response.data.choices[0].message.content;
    if (textMsg.indexOf("직원") != -1) {
        result = textMsg;
    } else {
        result = "직원 : " + textMsg;
    }
    if (result.indexOf("손님 :") !== -1) {
        result = result.substring(0, index1);
    }
    if (result.indexOf("손님:") !== -1) {
        result = result.substring(0, index2);
    }
    return result;
}


const handleAPIResponse = async (response) => {
    // function async handleAPIResponse(response) {
    var question = recentStaff + "\n" + recentCustomer;
    if (response.includes("ㄴ")) {
        question += "\nLook at the above conversation and select the menu the customer chose from the following lists.\n";
        question += "\nIf the menu selected by the guest is not in the view below, say None.\n";
        question += JSON.stringify(menuList);
        question += "\n answer : "
        console.log(question)
        var getResult = await getGpt(question)
        deciMenu = checkString(getResult, menuList) // 검사해서 첫번째로 겹치는거
        console.log(deciMenu);
        if (deciMenu != []) {
            addBadge("", "메뉴선택");
            for (var i = 0; i < deciMenu.length; i++) {
                addBadge("", deciMenu[i])
            }
            askContent = "";
        }
        else {
            askContent = "============메뉴판===========\n"
            askContent += JSON.stringify(menuList);
            askContent += "\n===========================\n"
            askContent += "Customer ordered [" + getResult
                + "], but there is no such menu. Serve customers by simply sentense. "
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
    StaffRespond();
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

const getGpt = async (keyword) => {
    var messages = [
        {
            role: "system",
            content: "Act as a person who chooses the correct answer",
        },
        { role: "user", content: keyword },
    ];

    setData(messages)

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", data, config);
        const result = response.data.choices[0].message.content;
        console.log(result);
        return result;
    } catch (error) {
        console.error(error);
        return null; // 또는 오류 처리 방식에 맞게 처리합니다.
    }
}

function search() {
    var getIntendScript = reqStr + "======== 대화내용 =========\n";
    getIntendScript += recentStaff + "\n";
    getIntendScript += recentCustomer;
    getIntendScript += "===========================\n";
    getIntendScript += "Answer : ";

    var messages = [
        { role: "system", content: "Act as a person who chooses the correct answer", },
        { role: "user", content: getIntendScript },
    ];
    setData(messages);

    axios
        .post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
        .then(function (response) {
            console.log(getIntendScript);
            console.log(response.data.choices[0].message.content);
            handleAPIResponse(response.data.choices[0].message.content);
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

    if (nextAskContent !== "" && askContent == "") {
        keywords += "The above is just a conversation between a cafe Staff and a customer.";
        keywords += "Ask about" + nextAskContent + "to customer by the language requested by the Customer.\n";
        keywords += "직원 : "
        var messages = [
            {
                role: "system",
                content: "you are a cafe Staff. Treat guests kindly.",
            },
            { role: "user", content: keywords },
        ];
        setData(messages);
        console.log(keywords);
        axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {
                console.log(response.data.choices[0].message.content);
                recentStaff = trimResponse(response)
                $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
                $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            })
            .catch(function (error) {
                console.error(error);
            });
    } else if (askContent != "") {
        keywords = askContent
        keywords += "직원 : "
        var messages = [
            { role: "system", content: "you are a cafe Staff. Treat guests kindly." },
            { role: "user", content: keywords },
        ];
        setData(messages);
        console.log(keywords);
        axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {
                console.log(response.data.choices[0].message.content);
                recentStaff = trimResponse(response);
                $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
                $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            })
            .catch(function (error) {
                console.error(error);
            });

    }

    else {
        recentStaff = "직원 : 주문이 모두 완료되었습니다. 잠시만 기다려주세요!";
        $("#chat-messages").append(recentStaff);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    }
}