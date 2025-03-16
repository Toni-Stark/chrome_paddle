// import * as ocr from "@paddlejs-models/ocr"
// import * as ocrdet from '@paddlejs-models/ocrdet'

// 🔥 1️⃣ 加载 OCR 检测（文本区域检测）模型
// async function loadOcrdetModels() {
//     try {
//         await ocrdet.load({ modelPath: chrome.runtime.getURL("models/ocr_recognition/") });
//     } catch (error) {
//         console.error("OCR 模型加载失败:", error);
//     }
// }
// async function loadOCRModel(ocr) {
//     try {
//         await ocr.init({ modelPath: chrome.runtime.getURL("models/ocr_detection/") });
//     } catch (error) {
//         console.error("OCR 识别模型加载失败:", error);
//     }
// }

function dataURLToBlob(dataURL) {
    console.log(dataURL, 'dataUrl')
    const byteString = atob(dataURL.split(",")[1]); // 去掉 "data:image/png;base64," 部分
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
}
async function processImageBuffer(imageBuffer) {
    try {
        // 1️⃣ 将 ArrayBuffer 转为 Blob
        const blob = new Blob([imageBuffer], { type: "image/png" });

        // 2️⃣ 创建 ImageBitmap
        const bitmap = await createImageBitmap(blob);

        // 3️⃣ 创建 OffscreenCanvas 并绘制图片
        const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = offscreen.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);

        // 4️⃣ 传递给 `ocrdet.detect()` 进行 OCR 识别
        const res = await ocrdet.detect(offscreen);
        console.log("OCR 目标检测结果:", res);

        return res;
    } catch (error) {
        console.error("OCR 目标检测失败:", error);
        return [];
    }
}
// 监听 content.js 发送的 OCR 请求
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if (message.action === "processImage" && message.dataURL) {
        console.log(123423)
        try {
            const blob = dataURLToBlob(message.dataURL);

            const bitmap = await createImageBitmap(blob);

            // 3️⃣ 创建 OffscreenCanvas 并绘制图片
            const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = offscreen.getContext("2d");
            ctx.drawImage(bitmap, 0, 0);
            // ✅ 2. 解析 Blob 为 ImageBitmap
            // const imageBitmap = await createImageBitmap(blob);

            const detectRes = await ocrdet.detect(offscreen);
            console.log("检测到的文本区域:", detectRes);

            // ✅ 4. 逐个识别文本
            const texts = [];
            if(detectRes?.boxes){
                for (const box of detectRes.boxes) {
                    const text = await ocr.recognize(imageBitmap, box);
                    console.log("OCR 识别结果:", text);
                    texts.push(text.text);
                }
            }
            console.log("OCR 识别结果:", texts);
            sendMessage(sender.tab.id, { success: true, result: texts })
            return true;
        } catch (error) {
            console.error("OCR 识别失败:", error);
            sendMessage(sender.tab.id, { success: false, error: error.message })
            return true;
        }
    }

    if (message.type === "SCREENSHOT_SHORTCUT") {
        console.log(message, 'type')
        chrome.tabs.captureVisibleTab(async (dataUrl) => {
            if (!dataUrl) return;
            const tabInfo = sender.tab;
            isNew = true;
            console.log(tabInfo, 'message')
            chrome.tabs.sendMessage(tabInfo.id,{
                msg: "SCREENSHOT_SHORTCUT",
                img: dataUrl,
                data: message.data,
            });
        });
        return;
    }
    return true;
});

function sendMessage(tab, params){
    chrome.tabs.sendMessage(tab, params);
}

// loadOcrdetModels()

// loadOCRModel(ocr)
