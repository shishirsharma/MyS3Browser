// Chrome Extension Service Worker (Manifest V3)

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/app/index.html') });
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('My S3 Browser installed');
  } else if (details.reason === 'update') {
    console.log('My S3 Browser updated to version', chrome.runtime.getManifest().version);
  }
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ status: 'pong' });
  }
  return true;
});
