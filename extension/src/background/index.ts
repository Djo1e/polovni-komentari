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
    return true; // keep channel open for async response
  }
});
