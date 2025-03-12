import * as paddlejs from '@paddlejs/paddlejs-core';
import '@paddlejs/paddlejs-backend-webgl';
import {Runner } from "@paddlejs/paddlejs-core";
paddlejs.env.set("webgl", false); // 直接使用 CPU

// import '@paddlejs/paddlejs-backend-webgpu';

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "displayResult") {
    alert("Paddle.js 预测结果：" + JSON.stringify(message.result));
  }
});
async function loadModels() {
  // 创建 OCR 检测模型
  const detectionRunner = new Runner({
    modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_detection/model.json",
    feedShape: [1, 224, 224, 3], // 图像的输入形状
    backend: "webgl",  // 或者指定其他后端
    fill: "#fff",
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    needPreheat: true,
    optimize: true,     // 禁用优化
  });

  console.log("加载 OCR 模型...",detectionRunner);
  detectionRunner.init()
      .then(() => console.log("模型初始化成功"))
      .catch(err => console.error("模型初始化失败:", err));;
  console.log("加载",detectionRunner);

  // 创建 OCR 识别模型
  const recognitionRunner = new Runner({
    modelPath: "http://icp_p_121_1c30.ldcvh.china-yun.net/modals/ocr_recognition/model.json",
    feedShape: [1, 224, 224, 3], // 图像的输入形状
    backend: "webgl",  // 或者指定其他后端
    fill: "#fff",
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    needPreheat: true,
    optimize: false,     // 禁用优化
  });

  console.log("OCR 模型加载中...");
  recognitionRunner.init()
      .then(() => console.log("模型初始化成功"))
      .catch(err => console.error("模型初始化失败:", err));;;
  console.log("OCR 模型加载完成");

  return { detectionRunner, recognitionRunner };
}

const getImgBase = async function (){
  return new Promise((resolve, reject)=>{
    const imageURL = "http://icp_p_121_1c30.ldcvh.china-yun.net/test.png";

    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域
    img.src = imageURL;
    img.onload = () => {
      console.log("图片加载成功");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        console.error("Canvas 获取 2D 上下文失败");
        return;
      }

      let width = 385
      let height = 197
      canvas.width = width;
      canvas.height = height;
      canvas.style = "position:fixed;top:0;left:0";
      canvas.className = "web_canvas";
      ctx.drawImage(img, 0, 0, width, height);
      // 获取 WebGL 上下文
      document.body.appendChild(canvas);
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        console.warn("WebGL 初始化失败，尝试使用 CPU 后端");
      } else {
        console.log("WebGL 启动成功");
      }
      try {
        const imageData = ctx.getImageData(0, 0, width, height  );
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
