import "./popup.css";

document.getElementById('analyze-btn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log(tab)
  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: ()=>{
  //   }
  // });
});

function analyzeImage() {
  let imgElement = document.querySelector("img");
  if (!imgElement) {
    alert("未找到图片");
    return;
  }

  let imgSrc = imgElement.src;
  console.log("图片URL:", imgSrc);

  chrome.runtime.sendMessage({ action: "analyzeImage", imgSrc });
}

