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

    });
}
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message, sender, 'message')
})

// 等待页面加载完成后执行
window.onload = captureImage;
