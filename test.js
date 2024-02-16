const API_KEY = "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"
const CONFIG = { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", }, };
const CHECK_TIME = 0.001;
const GPT_MODEL = "gpt-4-0613"
const URL = "https://api.openai.com/v1/chat/completions"
let data = { model: GPT_MODEL, messages: '' };
let isAddBadge = false;

let askContent;
let sizeList = ["톨", "그란데", "벤티"]
let payMethodList = ["카카오페이", "카드", "현금", "네이버페이"]
let hereOrTogo = ["for here", "to go"]
let deciList = [];

let maxId = 1;
let orderData = {};

function setMenuOrder(id, menu, size, option) {
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
    return orderData
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
    let functions = [
        {
            "name": "setMenuOrder",
            "description": "만약 고객이 메뉴를 주문한다면, 해당 함수를 호출한다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "메뉴의 고유한 값. 새로운 메뉴를 추가할 땐 '0'을 입력, 기존 메뉴를 수정할 땐 해당 메뉴의 id를 입력한다.",
                    },
                    "menu": {
                        "type": "string",
                        "description": "고객이 주문한 메뉴. '아이스 아메리카노', '아이스 카페라떼', '따뜻한 아메리카노', '따뜻한 카페라떼', '아이스 녹차', '따뜻한 녹차' 중 하나의 값만 올 수 있다.",
                    },
                    "size": {
                        "type": "string",
                        "description": "고객이 주문한 음료의 사이즈. '숏','톨','그란데','벤티' 중 하나의 값만 올 수 있다.",
                    },
                    "option": {
                        "type": "string",
                        "description": "고객이 주문한 음료의 옵션. '샷추가','얼음많이','얼음적게'가 가능하다.",
                    },

                },
                "required": ["id", "menu"],
            },
        },
        {
            "name": "getMenuOrder",
            "description": "이때까지 주문된 메뉴목록을 조회할 수 있다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        }
    ]

    messages = [{ "role": "user", "content": conversation }];
    data.messages = messages
    data.functions = functions
    data.function_call = "auto"

    return await postAxios(data, CONFIG)
}

async function search(conversation) {
    response = await gptFnCall(conversation);
    response_message = response.data.choices[0].message

    if (response_message.function_call.name == "getMenuOrder") {
        conversation = "대화내용 : " + conversation;
        conversation += "\n getMenuOrder() return value : " + JSON.stringify(getMenuOrder())
        search(conversation)
    }
    if (response_message.function_call == "setMenuOrder") {
        let args = JSON.parse(response_message.function_call.arguments);
        console.log(args)
        console.log(setMenuOrder(args.id, args.menu, args.size, args.option));
        //return setMenuOrder(args.menu, args.size, args.option);
    }

    else {
        console.log(response_message.content);
        //return response_message.content
    }
}


function initPage() {
    deciList = [];
    $("#chat-messages").empty();
    $("#chat-header").empty();
    $("#console").empty();
    $("#chat-header").append('<h2>키오스크챗</h2><div class ="badge-area"></div><div><button id="refresh-button"><i class="bi bi-arrow-clockwise"></i></button> <div class="status-circle green" id = "light"></div></div>');
    contents = [];
    var recentStaff = "직원 : 안녕하세요. RI카페입니다. 무엇을 도와 드릴까요?";
    var recentCustomer = '';
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