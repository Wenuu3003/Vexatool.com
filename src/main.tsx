import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto-recover from stale chunk errors after a new deploy.
// When the cached index.js references a chunk hash that no longer exists,
// dynamic import() rejects with "Failed to fetch dynamically imported module".
// Reload once to fetch the fresh index.js + chunk graph.
const STALE_CHUNK_RELOAD_KEY = "__stale_chunk_reloaded_at";
const isStaleChunkError = (msg: string) =>
  /Failed to fetch dynamically imported module/i.test(msg) ||
  /Importing a module script failed/i.test(msg) ||
  /ChunkLoadError/i.test(msg);

const tryReloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) || "0");
    if (Date.now() - last < 10_000) return; // avoid reload loops
    sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    window.location.reload();
  }
};

window.addEventListener("error", (e) => {
  if (e?.message && isStaleChunkError(e.message)) tryReloadOnce();
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = (e?.reason && (e.reason.message || String(e.reason))) || "";
  if (isStaleChunkError(msg)) tryReloadOnce();
});

createRoot(document.getElementById("root")!).render(<App />);
