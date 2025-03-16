import * as ocrdet from '@paddlejs-models/ocrdet'
// import * as ocrdet from "@paddlejs-models/ocr"
// import * as ocr from '@paddlejs-models/ocr'
let CON = null;
let domT = null;
let domR = null;
let domB = null;
let domL = null;
let domC = null;
let poiT = null;
let poiR = null;
let poiB = null;
let poiL = null;
let CONV = null;
let mouseEnter = null;
let start = null;
let end = null;
let drawFiles = null;
let w = window.innerWidth;
let h = window.innerHeight;

function loadOcrdetModels() {
    try {
        ocrdet.load({ modelPath: chrome.runtime.getURL("models/ocr_detection/") });
        // ocrdet.load({ modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_detection/" });
    } catch (error) {
        console.error("OCR 模型加载失败:", error);
    }
}
// function loadOCRModel() {
//     try {
     // //   ocr.init({ modelPath: chrome.runtime.getURL("models/ocr_recognition/") });
        // ocr.init();
//     } catch (error) {
//         console.error("OCR 识别模型加载失败:", error);
//     }
// }
const StartScreenFlash = (element) => {
    // 主动截取微信登录二维码
    if (!element) return;
    let rect = element.getBoundingClientRect();

    // 计算四个角的坐标
    let topLeft = { x: rect.left, y: rect.top };
    let topRight = { x: rect.right, y: rect.top };
    let bottomLeft = { x: rect.left, y: rect.bottom };
    let bottomRight = { x: rect.right, y: rect.bottom };

    sendMessageScreenIndex({ topLeft, topRight, bottomRight, bottomLeft });
};



const sendMessageScreenIndex = (data) => {
    chrome.runtime.sendMessage({ type: "SCREENSHOT_SHORTCUT", data },(res) => {
        console.log('info-res------------------>');
        console.log(res);
        console.log('info-res------------------>');
    });
};
loadOcrdetModels()
// loadOCRModel()

function addListener(){
    document.addEventListener("click", function (event) {
        const target = event.target; // 获取点击的元素
        if (target.tagName.toLowerCase() === "img") {
            console.log("点击的元素是 IMG:", target);
            StartScreenFlash(target)
        }
    });
}

function captureImage() {
    const img = document.querySelector("img");
    if (!img) {
        console.error("未找到图片");
        return;
    }

    // 创建 Canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // 获取 base64 图片数据
    const dataURL = canvas.toDataURL("image/png");

    // 发送到 background.js
    chrome.runtime.sendMessage({ action: "processImage", dataURL }, (response) => {
        if (response && response.success) {
            console.log("OCR 结果:", response.result);
        } else {
            console.error("OCR 处理失败:", response.error);
        }
    });
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request, sender, 'message')

    if (request?.msg === "SCREENSHOT_SHORTCUT") {
        createCanvasScreen(request.img, request.data);
    }
})
function createDom(dom, cla, text) {
    let d = document.createElement(dom);
    d.className = cla;
    if (text) {
        d.textContent = text;
    }
    return d;
}
const createCanvasScreen = (files, data) => {
    drawFiles = files;
    document.querySelector('body').style.overflow = 'hidden';
    CON = createDom('div', 'container_screen_dashed');
    document.querySelector('body').appendChild(CON);
    draw(files);
    settingMouseAuto(data);
};
function queryDom(str) {
    return document.querySelector(str);
}
function createSDom() {
    domT = createDom('div', 'domT');
    domR = createDom('div', 'domR');
    domB = createDom('div', 'domB');
    domL = createDom('div', 'domL');
    domC = createDom('div', 'domC');
    queryDom('.DomView').appendChild(domT);
    queryDom('.DomView').appendChild(domR);
    queryDom('.DomView').appendChild(domB);
    queryDom('.DomView').appendChild(domL);
    queryDom('.DomView').appendChild(domC);
}
function createSPoint() {
    poiT = createDom('div', 'poiT');
    poiL = createDom('div', 'poiL');
    poiR = createDom('div', 'poiR');
    poiB = createDom('div', 'poiB');
    queryDom('.DomPoi').appendChild(poiT);
    queryDom('.DomPoi').appendChild(poiR);
    queryDom('.DomPoi').appendChild(poiB);
    queryDom('.DomPoi').appendChild(poiL);
}
function settingMouseAuto(data) {
    CON.appendChild(createDom('div', 'DomView'));
    createSDom();
    queryDom('.domC').appendChild(createDom('div', 'DomPoi'));
    createSPoint();
    console.log('注册');
    let timer = setTimeout(() => {
        getBaseAndUpload(data.topLeft, data.bottomRight);

        clearTimeout(timer);
        timer = null;
    }, 1000);
}
function getBaseAndUpload(s, e) {
    if (!drawFiles) return;
    downLoadImg(s, e);
}
function processImageBuffer(image) {
    try {
        ocrdet.detect(image).then((boxs)=>{
            console.log("OCR 目标检测结果:", boxs);
            const texts = [];
            // if(boxs){
            //     for (const box of boxs) {
            //         ocr.recognize(image).then((text)=> {
            //             console.log("OCR 识别结果:", text);
            //         })
                        // , [
                        // [4.490625, 190.103125],[11.975, 190.103125],[11.975, 197.5875],[4.490625, 197.5875]
                    // ]);
            //         texts.push(text.text);
            //     }
            // }

            console.log("OCR 识别结果:", texts);
            // return boxs;
        });
    } catch (error) {
        console.error("OCR 目标检测失败:", error);
        return [];
    }
}
const downLoadImg = (s, e) => {
    // 选择用下载方式保存图片
    let w = window.innerWidth;
    let h = window.innerHeight;
    const Img = new Image();
    Img.src = drawFiles;
    Img.onload = () => {
        let iw = w / Img.width;
        let ih = h / Img.height;
        let canvas = document.createElement('canvas');
        canvas.width = e.x - s.x;
        canvas.height = e.y - s.y;
        canvas.style.width = e.x - s.x + 'px';
        canvas.style.height = e.y - s.y + 'px';
        let cth = canvas.getContext('2d');
        cth.drawImage(
            Img,
            s.x / iw,
            s.y / ih,
            (e.x - s.x) / iw,
            (e.y - s.y) / ih,
            0,
            0,
            e.x - s.x,
            e.y - s.y
        );
        let img = canvas.toDataURL('image/png');
        // 提交位置
        setTimeout(()=>{
            processImageBuffer(canvas)
        }, 1000)
    };
};
function draw(files) {
    let canvas1 = createDom('canvas', 'container_canvas');
    canvas1.width = w * 2;
    canvas1.height = h * 2;
    canvas1.style.width = w + 'px';
    canvas1.style.height = h + 'px';
    let ctx = canvas1.getContext('2d');
    let img = new Image();
    img.src = files;
    img.onload = function () {
        ctx.drawImage(img, 0, 0, w * 2, h * 2);
    };
    CON.appendChild(canvas1);
}
// 等待页面加载完成后执行
window.onload = addListener;
