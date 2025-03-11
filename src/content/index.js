import {Runner} from "@paddlejs/paddlejs-core";
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "displayResult") {
    alert("Paddle.js 预测结果：" + JSON.stringify(message.result));
  }
});
const detectionRunner = await new Runner({
  modelPath: chrome.runtime.getURL("models/ocr_detection/model.json"),
  fill: "#fff", // 预处理填充色
  mean: [0.485, 0.456, 0.406], // 归一化参数
  std: [0.229, 0.224, 0.225],
  needPreheat: true // 需要预热模型
});
// 创建 OCR 识别模型
const recognitionRunner = await new Runner({
  modelPath: chrome.runtime.getURL("models/ocr_recognition/model.json"),
  fill: "#fff",
  mean: [0.5, 0.5, 0.5],
  std: [0.5, 0.5, 0.5],
  needPreheat: true
});

async function loadModels() {
  // 创建 OCR 检测模型
  console.log(123)


  console.log("OCR 模型加载中...");
  await detectionRunner.init();
  await recognitionRunner.init();
  console.log("OCR 模型加载完成");

  return { detectionRunner, recognitionRunner };
}

const getImgBase = async function (){
  return new Promise((resolve, reject)=>{
    const imageURL = chrome.runtime.getURL("assets/test.png");
    console.log("扩展内的图片 URL:", imageURL);

    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      console.log("图片加载成功");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        console.error("Canvas 获取 2D 上下文失败");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      try {
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        console.log("imageData 获取成功", imageData);
        return resolve(canvas)
      } catch (error) {
        console.error("OCR 失败:", error);
        return null
      }
    };
  })
}

async function recognizeText(imgElement) {
  const { detectionRunner, recognitionRunner } = await loadModels();

  // 执行 OCR 文字检测
  console.log("开始 OCR 文字检测...",imgElement);
  const img = await getImgBase()
  if(!img) return;
  console.log("图片结果:", img);
  const detectionResult = await detectionRunner.predict(img);
  console.log("文字检测结果:", detectionResult);

  // 识别检测到的文字
  console.log("开始 OCR 文字识别...");
  const recognitionResult = await recognitionRunner.predict(detectionResult);
  console.log("OCR 识别结果:", recognitionResult);
}

// 监听右键点击图片
document.addEventListener("contextmenu", async (event) => {
  const target = event.target;
  if (target.tagName === "IMG") {
    await recognizeText(target);
  }
});
