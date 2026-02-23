// Chrome Extension Service Worker (Manifest V3)

// Google Analytics Configuration
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = 'G-Z67KC80X9V';
const API_SECRET = 'nZp9i8K-R82qX5vL7mN4Pw'; // Keep this private, only used server-side

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

// Get or create a persistent client ID for analytics
function getClientId(callback: (clientId: string) => void) {
  chrome.storage.local.get('ga_client_id', (result) => {
    let clientId = result.ga_client_id;
    if (!clientId) {
      clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
      chrome.storage.local.set({ ga_client_id: clientId });
    }
    callback(clientId);
  });
}

// Handle analytics events from the extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'ANALYTICS_EVENT') {
    getClientId((clientId) => {
      const payload = {
        client_id: clientId,
        timestamp_micros: Date.now() * 1000,
        user_properties: {
          extension_version: {
            value: chrome.runtime.getManifest().version
          }
        },
        events: [
          {
            name: request.eventName,
            params: request.eventParams
          }
        ]
      };

      fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).catch(error => {
        console.debug('[Analytics] Failed to send event:', error);
      });

      sendResponse({ success: true });
    });
    return true; // Indicate that we'll call sendResponse asynchronously
  }

  // Keep service worker alive
  if (request.type === 'ping') {
    sendResponse({ status: 'pong' });
  }
  return true;
});
