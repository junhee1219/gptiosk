const API_KEY = "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";
const CONFIG = { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", }, };
const CHECK_TIME = 0.001;
const GPT_MODEL = "gpt-4-0613"
const URL = "https://api.openai.com/v1/chat/completions"

let clickTimeout;
let data = { model: GPT_MODEL, messages: '' };
let isAddBadge = false;

let askContent;
let sizeList = ["톨", "그란데", "벤티"]
let payMethodList = ["카카오페이", "카드", "현금", "네이버페이"]
let hereOrTogo = ["for here", "to go"]
let deciList = [];

let maxId = 1;
let orderData = {};

function consoleLog(message, tag=""){
    if (tag != ""){
        $("#console").append(`<${tag}>${message}</${tag}><br><br>`);
    }
    else{
        $("#console").append(`${message}<br><br>`);
    }   
}

function setMenuOrder(id, menu, size, option) {
    // 신규등록 : id = '0'
    if (id == '0') {
        id = String(maxId);
        maxId = maxId + 1;
    }
    if (!orderData[id]) {
        orderData[id] = {};
    }
    orderData[id]["menu"] = menu;
    orderData[id]["size"] = size;
    orderData[id]["option"] = option;
}

function getMenuOrder() {
    return orderData;
}

async function postAxios(data, CONFIG) {
    try {
        const response = await axios.post(URL, data, CONFIG);
        return response;
    } catch (error) {
        console.error("Error in postAxios:", error);
        return null; // or throw error if you want to handle it in the calling function
    }
}

async function gptFnCall(conversation) {
    conversation = '손님의 대화를 보고 카페 점원으로써 역할을 수행하세요.\n' + conversation;
    conversation += '현재까지 주문된 메뉴 data : ' + JSON.stringify(getMenuOrder());
    let functions = [
        {
            "name": "setMenuOrder",
            "description": "This function must only be called when the customer orders/modifies the menu. If order is not matched by description, do not call this function.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "Key value of the menu. When adding a new menu, enter '0', and when modifying an existing menu, enter the ID of the menu.",
                    },
                    "menu": {
                        "type": "string",
                        "description": "Ordered Menu by the customer. menu must be only one of '아이스 아메리카노', '아이스 카페라떼', '따뜻한 아메리카노', '따뜻한 카페라떼', '아이스 녹차', '따뜻한 녹차'",
                    },
                    "size": {
                        "type": "string",
                        "description": "The size of the beverage ordered by the customer. size must be only one of '숏','톨','그란데','벤티' 중 하나의 값만 올 수 있다.",
                    },
                    "option": {
                        "type": "string",
                        "description": "Options for beverage ordered by customers. option must be only one of '샷추가','얼음많이','얼음적게'가 가능하다.",
                    },
                },
                "required": ["id", "menu"],
            },
        },
    ]

    messages = [{ "role": "user", "content": conversation }];
    data.messages = messages
    data.functions = functions
    data.function_call = "auto"

    return await postAxios(data, CONFIG);
}

async function afterFunctionCall(conversation) {
    console.log(conversation)
    messages = [{ "role": "user", "content": conversation }];
    var conversationRequest = { model: GPT_MODEL, messages: messages }
    response = await postAxios(conversationRequest, CONFIG);
    console.log(response)
    return response;
}


async function search(conversation) {
    response = await gptFnCall(conversation);
    response_message = response.data.choices[0].message;

    if (response_message?.function_call?.name == "setMenuOrder") {
        let args = JSON.parse(response_message.function_call.arguments);
        consoleLog("메뉴를 추가/수정 합니다..",tag="strong");
        setMenuOrder(args.id, args.menu, args.size, args.option);
        conversation = `${conversation}\n위의 요청에 따라 ${args.menu} 주문을 추가/수정했습니다. 점원으로써 친절하고 1문장 이내로 짧게 응대하세요.`;
        response = await afterFunctionCall(conversation);
        response_message = response.data.choices[0].message;
        consoleLog(response_message.content,tag="strong");
        $("#chat-messages").append($("<div>").text(response_message.content));
    }
    else {
        console.log(response_message.content);
        $("#chat-messages").append($("<div>").text(response_message.content));
    }
    consoleLog("현재까지 주문한 메뉴 : ")
    for (let key in orderData) {
        consoleLog ( JSON.stringify(orderData[key]));
      }
    
    
}


function initPage() {
    orderData = {}
    $("#chat-messages").empty();
    $("#chat-header").empty();
    $("#console").empty();
    $("#chat-header").append('<h2>키오스크챗</h2><div class ="badge-area"></div><div><button id="refresh-button"><i class="bi bi-arrow-clockwise"></i></button> <div class="status-circle green" id = "light"></div></div>');
    contents = [];
    $("#chat-messages").append("직원 : 안녕하세요. RI카페입니다. 무엇을 도와 드릴까요?"); // 메세지 채팅창에 보이기
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
    let CustomerMsg = "손님 : " + message;
    if (message.trim() !== "") {
        clearTimeout(clickTimeout); // 클릭 타이머 초기화
        let messageElement = $("<div>").text(CustomerMsg); // 메세지 채팅창에 보이기
        $("#chat-messages").append(messageElement); // 메세지 채팅창에 보이기
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
        $("#message-input").val(""); // 메세지 input창 clear
        
        search(CustomerMsg); // CHECK_TIME 초동안 입력없으면 API 호출
        
        
    }
});

$(document).ready(function () {
    initPage();
});