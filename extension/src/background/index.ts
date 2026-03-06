const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string;
const GA_API_SECRET = import.meta.env.VITE_GA_API_SECRET as string;
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

const SESSION_EXPIRY_MS = 30 * 60 * 1000;

async function getOrCreateClientId(): Promise<string> {
  const result = await chrome.storage.local.get("gaClientId");
  if (result.gaClientId) return result.gaClientId as string;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ gaClientId: id });
  return id;
}

async function getSessionId(): Promise<string> {
  const now = Date.now();
  const result = await chrome.storage.session.get(["gaSessionId", "gaSessionExpiry"]);
  if (result.gaSessionId && (result.gaSessionExpiry as number) > now) {
    await chrome.storage.session.set({ gaSessionExpiry: now + SESSION_EXPIRY_MS });
    return result.gaSessionId as string;
  }
  const id = String(now);
  await chrome.storage.session.set({ gaSessionId: id, gaSessionExpiry: now + SESSION_EXPIRY_MS });
  return id;
}

async function sendGAEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return;
  const clientId = await getOrCreateClientId();
  const sessionId = await getSessionId();
  fetch(GA_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      client_id: clientId,
      events: [{
        name,
        params: {
          session_id: sessionId,
          engagement_time_msec: "100",
          ...params,
        },
      }],
    }),
  }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "ABS_VIN_CHECK") {
    fetch("https://www.abs.gov.rs/rsc/vin", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `vin_input=${encodeURIComponent(msg.vin)}`,
    })
      .then((r) => r.text())
      .then((html) => sendResponse({ ok: true, html }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.type === "GA_EVENT") {
    sendGAEvent(msg.name, msg.properties ?? {});
  }
});
