'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: chrome.extension.getURL('index.html')});
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({'first_run': true}, function() {
    if (window.console) { console.log('[chrome.storage] set first_run'); }
  });
});

console.log('\'Allo \'Allo! Event Page for Page Action');
