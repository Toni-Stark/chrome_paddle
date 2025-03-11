import {Runner } from "@paddlejs/paddlejs-core";
import '@paddlejs/paddlejs-backend-webgl';
// import '@paddlejs/paddlejs-backend-webgpu';

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "displayResult") {
    alert("Paddle.js 预测结果：" + JSON.stringify(message.result));
  }
});
async function loadModels() {
  // 创建 OCR 检测模型
  const detectionRunner = new Runner({
    modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_detection/model.json", // model path, e.g. http://xx.cc/path, http://xx.cc/path/model.json, /localModelDir/model.json, /localModelDir
    feedShape: [1, 224, 224, 3], // 图像的输入形状
    backend: "webgl",  // 或者指定其他后端
    fill: "#fff",
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    needPreheat: false,  // 禁用预热
    optimize: false,     // 禁用优化
  });
  console.log("加载 OCR 模型...",detectionRunner);
  await detectionRunner.init();

  // 创建 OCR 识别模型
  const recognitionRunner = new Runner({
    modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_recognition/model.json",
    feedShape: [1, 224, 224, 3], // 图像的输入形状
    backend: "webgl",  // 或者指定其他后端
    fill: "#fff",
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    needPreheat: false,  // 禁用预热
    optimize: false,     // 禁用优化
  });
  console.log("加载",detectionRunner);

  console.log("OCR 模型加载中...");
  await recognitionRunner.init();
  console.log("OCR 模型加载完成");

  return { detectionRunner, recognitionRunner };
}

const getImgBase = async function (){
  return new Promise((resolve, reject)=>{
    const imageURL = chrome.runtime.getURL("assets/test.png");

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
