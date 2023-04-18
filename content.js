chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveSelectedContent") {
      const selectedContent = window.getSelection().toString();
      const range = window.getSelection().getRangeAt(0);
      const div = document.createElement("div");
      div.appendChild(range.cloneContents());
  
      const data = {
        text: selectedContent,
        html: div.innerHTML,
      };
  
      chrome.runtime.sendMessage({ action: "captureSelectedContent", data });
    }
  });
  