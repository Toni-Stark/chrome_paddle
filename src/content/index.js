chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "displayResult") {
    alert("Paddle.js 预测结果：" + JSON.stringify(message.result));
  }
});
