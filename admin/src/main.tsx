import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;
if (!CONVEX_URL) throw new Error("Missing VITE_CONVEX_URL env var");

const convex = new ConvexReactClient(CONVEX_URL);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
