// import * as ocr from "@paddlejs-models/ocr"
import * as ocrdet from '@paddlejs-models/ocrdet'

// 🔥 1️⃣ 加载 OCR 检测（文本区域检测）模型
async function loadOcrdetModels() {
    try {
        await ocrdet.load({ modelPath: chrome.runtime.getURL("models/ocr_recognition/") });
    } catch (error) {
        console.error("OCR 模型加载失败:", error);
    }
}
async function loadOCRModel(ocr) {
    try {
        await ocr.init({ modelPath: chrome.runtime.getURL("models/ocr_detection/") });
    } catch (error) {
        console.error("OCR 识别模型加载失败:", error);
    }
}

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
// 监听 content.js 发送的 OCR 请求
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if (message.action === "processImage" && message.dataURL) {
        console.log(123423)
        try {

            const blob = dataURLToBlob(message.dataURL);

            // ✅ 2. 解析 Blob 为 ImageBitmap
            const imageBitmap = await createImageBitmap(blob);
            const detectRes = await ocrdet.detect(imageBitmap);
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
    return true;
});

function sendMessage(tab, params){
    chrome.tabs.sendMessage(tab, params);
}

loadOcrdetModels()

// loadOCRModel(ocr)
