// import * as ocrdet from '@paddlejs-models/ocrdet'
// import * as ocr from "@paddlejs-models/ocr"
import * as ocr from 'paddlejs-models-ocr'
// import { Runner } from "@paddlejs/paddlejs-core";
// import '@paddlejs/paddlejs-backend-webgl';
console.log("WebGL 版本:", (WebGL2RenderingContext ? 2 : (WebGLRenderingContext ? 1 : "不支持")));
// const runner = new Runner({
//     modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_recognition/", // 本地模型路径
//     fileCount: 4,
//     feedShape: { fw: 1, fh: 48 },
//     backend: "webgl", // 或者 "webgl"
//     webglVersion: 2
// });
// runner.init().then(() => {
//     console.log("模型加载成功！");
// }).catch((err) => {
//     console.error("模型加载失败:", err);
// });
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
let drawFiles = null;
let w = window.innerWidth;
let h = window.innerHeight;

function loadOcrdetModels() {
    try {
        ocr.init().then(() => {
            console.log("模型加载成功！");
        }).catch((err) => {
            console.error("模型加载失败:", err);
        });
        // ocr.init(
        //     "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_detection/model.json",
        //     "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_recognition/model.json"
        // );

        // ocrdet.load({ modelPath: chrome.runtime.getURL("models/ocr_detection/") });
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
function processImageBuffer(image, canvas) {
    try {

        // runner.predict(image).then((res)=>{
        //     console.log("OCR 目标检测结果:", res);
        // });

        // ocr.recognize(image, {canvas: canvas}).then((boxs)=>{
        //     console.log("OCR 目标检测结果:", boxs);
        //     const texts = [];
        //     // if(boxs){
        //     //     for (const box of boxs) {
        ocr.recognize(image, { scaleFactor: 2, batchSize: 4 }).then((text)=> {
            console.log("OCR 识别结果:", text);
        })
        //                 // , [
        //                 // [4.490625, 190.103125],[11.975, 190.103125],[11.975, 197.5875],[4.490625, 197.5875]
        //             // ]);
        //     //         texts.push(text.text);
        //     //     }
        //     // }
        //
        //     // return boxs;
        // });
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
        let devicePixelRatio = window.devicePixelRatio || 1; // 获取屏幕分辨率比例
        let scaleFactor = Math.max(devicePixelRatio, 3);
        let iw = w / Img.width;
        let ih = h / Img.height;

        // 设置 canvas 高分辨率
        let canvas = document.createElement('canvas');
        let canvasWidth = (e.x - s.x) * scaleFactor;
        let canvasHeight = (e.y - s.y) * scaleFactor;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = (e.x - s.x) + 'px';
        canvas.style.height = (e.y - s.y) + 'px';

        let ctx = canvas.getContext('2d');
        ctx.scale(scaleFactor, scaleFactor); // 放大画布，避免缩放模糊

        ctx.drawImage(
            Img,
            s.x, s.y, e.x - s.x, e.y - s.y,  // 裁剪的原始图像部分
            0, 0, (e.x - s.x) * scaleFactor, (e.y - s.y) * scaleFactor // 放大绘制
        );

        // 转换为灰度图
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // 计算灰度
            data[i] = data[i + 1] = data[i + 2] = avg > 128 ? 255 : 0; // 二值化处理（黑白）
        }
        ctx.putImageData(imageData, 0, 0);
        // 提交位置
        document.body.appendChild(Img);
        setTimeout(()=>{
            processImageBuffer(Img, canvas)
        }, 2000)
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
