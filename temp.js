let xhr = new XMLHttpRequest();
let clickTimeout;
const CHECKTIME = 0.001;
let contents = [];
let recentStaff = '';
let recentCustomer = '';
let menuData;
let isAddBadge = false;
let menuList;
let askContent;
let sizeList = ["톨", "그란데", "벤티"]
let payMethodList = ["카카오페이", "카드", "현금", "네이버페이"]
let hereOrTogo = ["for here", "to go"]
let deciList = [];

let reqStr = '';
reqStr += "ㄱ. 손님 order coffee menu to order.\n";
reqStr += "ㄴ. 손님 order coffee size.\n";
reqStr += "ㄷ. 손님 order payment method to pay.\n";
reqStr += "ㄹ. 손님 order for here or to go.\n";
reqStr += "ㅁ. 손님 just ask or request to the staff.(recommendation, information, etc..)\n";
reqStr += "ㅂ. Others.(ice breaking, small talk, etc..)\n";
reqStr += "The below is a conversation between 직원 and 손님 at a cafe.\n";
reqStr += "Choose only correct answers about 손님.\n";
reqStr += "If it is a simple question(ㅁ) or just small talk(ㅂ), answer only ㅁ or ㅂ.\n";


var menuStr = "아래 대화를 보고 손님이 주문한 메뉴를 setMenu 함수의 input으로 입력해라\n"
menuStr += "setMenu는 map을 input으로 받고, key는 메뉴이름(str), value는 수량(int)이다.\n"
menuStr += "예를들어 아메리카노 2잔, 카페라떼 1잔을 시켰다면 setMenu({'아메리카노' : 2 , '카페라떼' : 1})로 호출해라.\n"
menuStr += "다음은 손님과 직원의 대화내용이다.\n"

let API_KEY = "sk-DX8rY";
API_KEY += "Kz3zBBjW";
API_KEY += "Hy3M2MCT3Blb";
API_KEY += "kFJ3jlXuPm";
API_KEY += "U3J0zeBBAboBB";

let config = { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", }, };
let data = { model: "gpt-4-0613", messages: '' };

function toggleLight() {
    let nowAttr = $("#light").attr("class").split(" ")[1]
    if (nowAttr == "green") {
        $("#light").removeClass("green").addClass("red");
        $("#message-input").prop("disabled", true);
    } else {
        $("#light").removeClass("red").addClass("green");
        $("#message-input").prop("disabled", false);
    }
}

function equals(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function setData(messages) { data.messages = messages; }

function checkString(str, listdata) {
    let result = [];
    for (let i = 0; i < listdata.length; i++) {
        if (str.includes(listdata[i])) {
            result.push(listdata[i]);
        }
    }
    return result;
};

function replaceDivtoNew(str) {
    return str.replace(/<\/?div>/g, '\n');
}

xhr.open("GET", "data.json", true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        menuData = JSON.parse(xhr.responseText);
        menuList = menuData.menu.map(item => item.name);
    }
};
xhr.send();

function initPage() {
    deciList = [];
    $("#chat-messages").empty();
    $("#chat-header").empty();
    $("#console").empty();
    $("#chat-header").append('<h2>키오스크챗</h2><div class ="badge-area"></div><div><button id="refresh-button"><i class="bi bi-arrow-clockwise"></i></button> <div class="status-circle green" id = "light"></div></div>');
    contents = [];
    recentStaff = "직원 : 안녕하세요. RI카페입니다. 무엇을 도와 드릴까요?";
    recentCustomer = '';
    $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
    $("#refresh-button").click(function () {
        initPage();
    });
};

$("#message-input").keypress(function (e) {
    if (e.which === 13) {
        $("#send-button").click();
        return false;
    }
});

$("#send-button").click(function () {
    $("#console").empty();
    let message = $("#message-input").val();
    CustomerMsgForView = "손님 : " + message;
    recentCustomer += "손님 : " + message;
    if (message.trim() !== "") {
        clearTimeout(clickTimeout); // 클릭 타이머 초기화
        let messageElement = $("<div>").text(CustomerMsgForView); // 메세지 채팅창에 보이기
        $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        $("#message-input").val(""); // 메세지 input창 clear
        clickTimeout = setTimeout(search(), CHECKTIME * 1); // CHECKTIME 초동안 입력없으면 API 호출
    }
});

$(document).ready(function () {
    initPage();
});


function search() {
    toggleLight();
    let getIntendScript = reqStr + "======== 대화내용 =========\n";
    getIntendScript += recentStaff + "\n";
    getIntendScript += recentCustomer + "\n";
    getIntendScript += "===========================\n";
    getIntendScript += "Answer : ";
    let messages = [{ "role": "user", "content": getIntendScript }];
    setData(messages);

    axios
        .post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
        .then(function (response) {
            $("#console").append(getIntendScript.replace(/\n/g, "<br>"));
            $("#console").append("<strong>" + response.data.choices[0].message.content + "</strong><br><br>");
            gptResponse(response.data.choices[0].message.content);
        })
        .catch(function (error) {
            console.error(error);
        });


}


function trimResponse(response) {
    let result;
    let textMsg = response.data.choices[0].message.content;
    if (textMsg.indexOf("직원:") != -1 || textMsg.indexOf("직원 :") != -1) {
        result = textMsg;
    } else {
        result = "직원 : " + textMsg;
    }
    index1 = result.indexOf("손님 :");
    index2 = result.indexOf("손님:");
    if (index1 != -1) {
        result = result.substring(0, index1);
    }
    if (index2 != -1) {
        result = result.substring(0, index2);
    }
    return result;
}

async function gptResponse(response) {
    


    askContent = "";
    isAddBadge = false;
    // function async gptResponse(response) {
    let question = ""
    if (response.includes("ㄱ")) {
        question = recentStaff + "\n" + recentCustomer;
        question += "\nLook at the above conversation and select the menu the 손님 chose from the following lists.\n";
        question += "\nIf the menu selected by the guest is not in the view below, say None.\n";
        question += "============메뉴판===========\n";
        question += JSON.stringify(menuList);
        question += "\n===========================\n";
        question += "\n 답 : "
        let getResult = await getGpt(question);
        deciMenu = checkString(getResult, menuList) // 겹치는거 list로 반환
        if (!equals(deciMenu, [])) {
            addBadge("", "메뉴선택");
            for (let i = 0; i < deciMenu.length; i++) {
                addBadge("modal-content", deciMenu[i])
            }
        }
        else {
            askContent = "============메뉴판===========\n"
            askContent += JSON.stringify(menuList);
            askContent += "\n===========================\n"
            askContent += recentStaff + "\n" + recentCustomer + "\n"
            askContent += "손님이 이야기한 메뉴는 메뉴판에 없다. 메뉴판을 참고해서 응대해라."
        }
    }
    if (response.includes("ㄴ")) {
        question = recentStaff + "\n" + recentCustomer;
        question += "\nLook at the above conversation and select the size the 손님 chose from the following lists.\n";
        question += "\nIf the size selected by the guest is not in the view below, say None.\n";
        question += JSON.stringify(sizeList);
        question += "\n 답 : "
        let getResult = await getGpt(question);
        let deciSize = checkString(getResult, sizeList);

        if (!equals(deciSize, [])) {
            addBadge("", "사이즈");
            for (let i = 0; i < deciSize.length; i++) {
                addBadge("modal-content", deciSize[i])
            }
        }
        else {
            askContent = "===========음료 사이즈 목록===========\n"
            askContent += JSON.stringify(sizeList);
            askContent += "\n===========================\n"
            askContent += recentStaff + "\n" + recentCustomer + "\n"
            askContent += "손님이 이야기한 음료 사이즈는 목록에 없다. 음료 사이즈 목록을 참고해서 응대해라."
        }
    }

    if (response.includes("ㄷ")) {
        question = recentStaff + "\n" + recentCustomer;
        question += "\nLook at the above conversation and select the pay method 손님 chose from the following lists.\n";
        question += "\nIf the pay method selected by the 손님 is not in the view below, say None.\n";
        question += JSON.stringify(payMethodList);
        question += "\n 답 : "
        let getResult = await getGpt(question);
        let deciPay = checkString(getResult, payMethodList);

        if (!equals(deciPay, [])) {
            addBadge("", "결제수단");
            for (let i = 0; i < deciPay.length; i++) {
                addBadge("modal-content", deciPay[i])
            }
        }
        else {
            askContent = "===========결제수단 목록===========\n"
            askContent += JSON.stringify(payMethodList);
            askContent += "\n===========================\n"
            askContent += recentStaff + "\n" + recentCustomer + "\n"
            askContent += "손님이 이야기한 결제수단은 목록에 없다. 결제수단 목록을 참고해서 응대해라."
        }
    }

    if (response.includes("ㄹ")) {
        question = recentStaff + "\n" + recentCustomer;
        question += "\n위 대화를 보고 손님이 매장에서 식사할지(for here) or 테이크아웃할지(to go) 보기에서 고르시오.\n";
        question += "\n매장에서 식사할지, 테이크아웃할지 정해지지 않았다면 None이라고 대답하세요.\n 보기 :";
        question += JSON.stringify(hereOrTogo);
        question += "\n Answer : "
        let getResult = await getGpt(question);
        getResult = getResult.toLowerCase();
        if (getResult.includes("for here")) {
            getResult = "매장식사";
        } else if (getResult.includes("to go")) {
            getResult = "테이크아웃";
        } else {
            getResult = "";
        }
        if (!equals(getResult, "")) {
            addBadge("", "테이크아웃여부"); // 여기까지만 하기
            addBadge("modal-content", getResult);
        }
        else{
            askContent = recentStaff + "\n" + recentCustomer + "\n"
            askContent += "손님이 먹고갈지, 테이크아웃할지 여부를 이해못했다. 다시한번 물어봐라."
        }
    }
    if (isAddBadge) {
        openPopup();
    }
    // const closeModalBtn = document.getElementById('closeModalBtn');
    // closeModalBtn.addEventListener('click', () => {
    //     // 확인버튼누르면 저장되는걸로
    //     modal.style.display = 'none';
    // });
    const modal = document.getElementById('modal');
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
     StaffRespond();
}

function addBadge(cls, content) {
    if (!contents.includes(content)) { // 이미 있으면 push안함.. 그럼 수정은 어떻게?
        contents.push(content);
        if (cls == "" || cls == undefined) {
            $(".badge-area").append('<div class="badge">' + content + "</div>");
        } else {
            isAddBadge = true;
            $("#" + cls).append('<div class="badge">' + content + "</div>");
        }
    }
}

async function getGpt(keyword) {
    let messages = [{ role: "user", content: keyword }];
    setData(messages)
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", data, config);
        const result = response.data.choices[0].message.content;
        $("#console").append(keyword.replace(/\n/g, "<br>"));
        $("#console").append("<strong>" + result + "</storng><br><br>");
        return result;
    } catch (error) {
        console.error(error);
        return null; 
    }
}


function StaffRespond() {

    var keywords = replaceDivtoNew($("#chat-messages").html());

    let messages = [
        {
            role: "system",
            content: "you are a cafe Staff. Treat guests kindly.",
        },
        { role: "user", content: keywords },
    ];
    setData(messages);

    axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {
                recentStaff = trimResponse(response)
                $("#console").append(keywords.replace(/\n/g, "<br>"));
                $("#console").append("<strong>" + response.data.choices[0].message.content + "</strong><br><br>");
                $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
                $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            })
            .catch(function (error) {
                console.error(error);
            });


    keywords = recentStaff + "\n" + recentCustomer;
    recentCustomer = ""; // 다 썼으면 flush
    let nextAskContent = "";
    if (contents.indexOf("메뉴선택") == -1) {
        nextAskContent = "어떤 메뉴를 선택하시겠어요?";
    }
    else if (contents.indexOf("사이즈") == -1) {
        nextAskContent = "사이즈는 어떻게 해드릴까요? 톨, 그란데, 벤티사이즈 있습니다.";
    }
    else if (contents.indexOf("테이크아웃여부") == -1) {
        nextAskContent = "매장식사 하시겠어요? 아니면 테이크아웃 하시나요?";
    }
    else if (contents.indexOf("결제수단") == -1) {
        nextAskContent = "결제수단은 어떻게 하시겠어요? 카카오페이, 네이버페이, 카드, 현금 가능합니다.";
    }
    if (nextAskContent !== "" && askContent == "") {
        keywords += "\n위는 카페 직원과 손님의 대화이다.";
        keywords += "\n 대화의 흐름에 맞게["+ nextAskContent + "]를 자연스럽게 말해라. 한국어로 간단하게 1~2 문장으로 말할 것.\n";
        keywords += "직원 : "
        let messages = [
            {
                role: "system",
                content: "you are a cafe Staff. Treat guests kindly.",
            },
            { role: "user", content: keywords },
        ];
        setData(messages);

        axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {

                recentStaff = trimResponse(response)
                $("#console").append(keywords.replace(/\n/g, "<br>"));
                $("#console").append("<strong>" + response.data.choices[0].message.content + "</strong><br><br>");
                $("#chat-messages").append(recentStaff); // 메세지 채팅창에 보이기
                $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
            })
            .catch(function (error) {
                console.error(error);
            });
    } else if (askContent != "") {
        keywords = askContent
        keywords += "직원 : "
        let messages = [
            { role: "system", content: "you are a cafe Staff. Treat guests kindly." },
            { role: "user", content: keywords },
        ];
        setData(messages);

        axios.post("https://api.openai.com/v1/chat/completions", data, config) // POST 요청
            .then(function (response) {

                recentStaff = trimResponse(response);
                $("#console").append(keywords.replace(/\n/g, "<br>"));
                $("#console").append("<strong>" + response.data.choices[0].message.content + "</strong><br><br>");
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
    toggleLight();
}

function openPopup() {
    modal.style.display = 'block';
}
