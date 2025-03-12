import * as ocrdet from "@paddlejs-models/ocrdet";
// import * as ocr from "@paddlejs-models/ocr";

let isModelOcrdetLoaded = false;
// let isModelOcrLoaded = false;
// 🔥 1️⃣ 加载 OCR 检测（文本区域检测）模型
async function loadOcrdetModels() {
    if (isModelOcrdetLoaded) return; // 避免重复加载
    try {
        await ocrdet.load({ modelPath: chrome.runtime.getURL("models/ocr_detection/") });
        console.log("OCR 模型加载完成");
        isModelOcrdetLoaded = true;
    } catch (error) {
        console.error("OCR 模型加载失败:", error);
    }
}
// async function loadOCRModel() {
//     if (isModelOcrLoaded) return; // 避免重复加载
//     try {
//         await ocr.init({ modelPath: chrome.runtime.getURL("models/ocr_recognition/") });
//         console.log("OCR 识别模型加载完成");
//         isModelOcrLoaded = true;
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
// 监听 content.js 发送的 OCR 请求
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "processImage" && message.dataURL) {
        try {
            await loadOcrdetModels();
            // await loadOCRModel();

            const blob = dataURLToBlob(message.dataURL);

            // ✅ 2. 解析 Blob 为 ImageBitmap
            const imageBitmap = await createImageBitmap(blob);

            // const res = await ocr.recognize(imageBitmap);
            // console.log("OCR 识别结果:", res.text);
            // ✅ 3. 先进行文本区域检测
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

// 初始化 OCR
loadOcrdetModels();
// loadOCRModel();
