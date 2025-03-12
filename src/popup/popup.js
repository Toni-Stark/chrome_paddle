document.getElementById("runOcrBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const img = document.querySelector("img");
        if (!img) return null;
        console.log(img, "img")
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    }, (results) => {
      console.log(results, "results")
      if (results && results[0] && results[0].result) {
        chrome.runtime.sendMessage({ action: "runOCR", imageData: results[0].result }, (response) => {
          console.log("OCR 结果:", response);
          document.getElementById("result").innerText = JSON.stringify(response, null, 2);
        });
      }
    });
  });
});
