import React from "react";
import { createRoot } from "react-dom/client";
import { extractListingId } from "../utils/listingId";
import { getOrCreateAnonymousId } from "../utils/anonymousId";
import App from "../components/App";
import styles from "./shadow.css?inline";

async function main() {
  const listingId = extractListingId(window.location.href);
  if (!listingId) return;

  const anonymousId = await getOrCreateAnonymousId();

  const host = document.createElement("div");
  host.id = "pa-comments-host";
  host.style.position = "relative";
  host.style.zIndex = "2147483647";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;
  shadow.appendChild(style);

  const portalTarget = document.createElement("div");
  shadow.appendChild(portalTarget);

  const container = document.createElement("div");
  shadow.appendChild(container);

  createRoot(container).render(
    <React.StrictMode>
      <App listingId={listingId} anonymousId={anonymousId} portalContainer={portalTarget} />
    </React.StrictMode>
  );
}

main();
