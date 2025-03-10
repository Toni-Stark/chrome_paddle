import { Runner } from '@paddlejs/paddlejs-core';
let active = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "analyzeImage") {
        const imgSrc = message.imgSrc;
        const result = await analyzeWithPaddle(imgSrc);
        chrome.tabs.sendMessage(sender.tab.id, { action: "displayResult", result });
    }
});

async function analyzeWithPaddle(imgSrc) {
    const model = paddle.createModel({
        modelPath: chrome.runtime.getURL("model/model.json"),
        useWebGL: true
    });

    await model.load();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imgSrc;

    return new Promise((resolve) => {
        image.onload = async () => {
            const prediction = await model.predict(image);
            resolve(prediction);
        };
    });
}


function changeTheme(color) {
    document.body.style.backgroundColor = color;
}

chrome.action.onClicked.addListener((tab) => {
    active = !active;
    const color = active ? 'black' : 'white';
    chrome.scripting.executeScript({
        target: {tabId: tab.id ? tab.id : -1},
        func: changeTheme,
        args: [color]
    }).then();
});
