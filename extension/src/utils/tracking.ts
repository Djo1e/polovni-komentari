export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  chrome.runtime.sendMessage({ type: "GA_EVENT", name, properties });
}
