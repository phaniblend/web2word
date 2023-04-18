chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.create({
    title: "Save ChatGPT conversation",
    contexts: ["selection"],
    onclick: saveSelectedContent,
  });
}

function saveSelectedContent(info, tab) {
  chrome.tabs.executeScript(
    {
      code: `
        const messageBoxes = document.querySelectorAll('.msg-text-container .msg-text');
        const messages = [];
        messageBoxes.forEach(messageBox => {
          messages.push(messageBox.innerText);
        });
        const data = messages.join('\\n\\n');
        navigator.clipboard.writeText(data);
      `
    },
    () => {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Conversation copied",
        message: "The conversation has been copied to your clipboard.",
      });
    }
  );
}
