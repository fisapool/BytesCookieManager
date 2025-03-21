import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { getChromeAPI, isExtensionEnvironment } from "./lib/chromeMock";

// Initialize the Chrome extension popup
createRoot(document.getElementById("root")!).render(<App />);

// Initialize background service worker communication
console.log("FISABytes: Cookie manager initialized");

// Listen for messages from the service worker if in extension environment
if (isExtensionEnvironment()) {
  const chrome = getChromeAPI();
  chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    if (message.type === "COOKIES_EXPORTED") {
      sendResponse({ status: "success" });
    }
    return true;
  });
}
