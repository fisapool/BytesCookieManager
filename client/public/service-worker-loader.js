// Service worker for FISABytes
self.addEventListener('install', (event) => {
  console.log('FISABytes Service Worker installing...');
  event.waitUntil(
    Promise.resolve()
      .then(() => self.skipWaiting())
      .catch(error => console.error('Install error:', error))
  );
});

self.addEventListener('activate', (event) => {
  console.log('FISABytes Service Worker activated');
  event.waitUntil(
    Promise.resolve()
      .then(() => self.clients.claim())
      .catch(error => console.error('Activation error:', error))
  );
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in service worker:', message);
  
  if (message.type === 'EXPORT_COOKIES') {
    // Handle cookie export in the background if needed
    sendResponse({ status: 'success' });
  } else if (message.type === 'IMPORT_COOKIES') {
    // Handle cookie import in the background if needed
    sendResponse({ status: 'success' });
  }
  
  return true; // Keep the message channel open for async response
});

console.log('FISABytes Service Worker loaded');
