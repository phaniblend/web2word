chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.create(
    {
      title: "Save selected content",
      contexts: ["selection"],
      onclick: saveSelectedContent,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    }
  );
}

function saveSelectedContent(info, tab) {
  chrome.tabs.sendMessage(tab.id, { action: "saveSelectedContent" });
}

if (chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureSelectedContent") {
      captureSelectedContent(message, sender, sendResponse);
    }

    if (message.action === "saveDocument") {
      saveDocument(message, sender, sendResponse);
    }
  });
} else {
  console.error('chrome.runtime is undefined');
}

function captureSelectedContent(message, sender, sendResponse) {
  const data = message.data;
  chrome.storage.local.set({ data }, () => {
    chrome.runtime.sendMessage({ action: "selectedContentCaptured" });
  });
}

function saveDocument(message, sender, sendResponse) {
  const data = message.data;
  const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
  const filename = `selected-content-${Date.now()}.docx`;
  chrome.downloads.download({ url: URL.createObjectURL(blob), filename }, () => {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Document saved",
      message: `The document '${filename}' has been saved to your downloads folder.`,
    });
  });
}

chrome.clipboard.onRead.addListener((data, type) => {
  if (type === "text/html") {
    const imageRegex = /<img[^>]*src="([^"]*)"[^>]*>/g;
    const matches = data.match(imageRegex);

    if (matches !== null) {
      const promises = matches.map((match) => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            const regex = new RegExp(match, "g");
            data = data.replace(regex, `<img src="${dataURL}">`);
            resolve();
          };
          image.onerror = () => {
            reject();
          };
          image.src = match.match(/src="([^"]*)"/)[1];
        });
      });
      Promise.all(promises).then(() => {
        chrome.clipboard.write({ data });
      });
    }
  }
});
