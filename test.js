let xhr = new XMLHttpRequest();
let clickTimeout;
let checkTime = 0.001;
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

let API_KEY = "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"

let config = { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", }, };
let data = { model: "gpt-4-0613", messages: '' };
let maxId = 1;
let orderdata = {};

function set_menu_order(id, menu, size, option) {
    if (id == '0'){
        id = String(maxId);
        maxId = maxId + 1;
    }
    if (!orderdata[id]) {
        orderdata[id] = {};
    }
    orderdata[id]["menu"] = "아이스 아메리카노";
    orderdata[id]["menu"] = menu;
    orderdata[id]["size"] = size;
    orderdata[id]["option"] = option;

    console.log("주문내역 : ", menu, size, option);
}

function get_menu_order() {
    return orderdata
}

async function postAxios(data, config) {
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", data, config);
        return response;
    } catch (error) {
        console.error("Error in postAxios:", error);
        return null; // or throw error if you want to handle it in the calling function
    }
}

async function gptFnCall(keyword) {
    let functions = [
        {
            "name": "set_menu_order",
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
            "name": "get_menu_order",
            "description": "이때까지 주문된 메뉴목록을 조회할 수 있다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        }

    ]

    messages = [{ "role": "user", "content": keyword }];
    data.messages = messages
    data.functions = functions
    data.function_call = "auto"
    return await postAxios(data, config)
}

async function search(keyword) {
    response = await gptFnCall(keyword);
    response_message = response.data.choices[0].message

    if (response_message.function_call.name == "get_menu_order") {
        keyword = "대화내용 : " + keyword;
        keyword += "\n get_menu_order() return value : " + JSON.stringify(get_menu_order())
        search(keyword)
    }
    else {
        if (response_message.function_call) {
            let args = JSON.parse(response_message.function_call.arguments);
            console.log(args)
            console.log(set_menu_order(args.id, args.menu, args.size, args.option));
            //return set_menu_order(args.menu, args.size, args.option);
        } else {
            console.log(response_message.content);
            //return response_message.content
        }
    }
}




