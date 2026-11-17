import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import UpdateBanner from './components/UpdateBanner.tsx'

// Offline app shell (production only, so it never caches the dev server)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // The entry chunk's file name carries the build hash (index-XXXX.js), so it changes on every deploy
  const build = new URL(import.meta.url).pathname.split('/').pop() ?? '';

  window.addEventListener('load', () => {
    // A new ?v= installs a fresh service worker, which drops the previous build's cache
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(build)}`).catch(() => {});
  });

  // When the user comes back to the app, check whether a newer build has been deployed.
  // '/version-check' is rewritten to index.html by Vercel and bypasses the service worker cache.
  let notified = false;
  const checkForUpdate = async () => {
    if (notified || document.visibilityState !== 'visible' || !navigator.onLine) return;
    try {
      const html = await (await fetch('/version-check', { cache: 'no-store' })).text();
      if (html.includes('/assets/index-') && !html.includes(build)) {
        notified = true;
        window.dispatchEvent(new Event('fitlog:update-available'));
      }
    } catch {
      /* offline or blocked: try again later */
    }
  };
  document.addEventListener('visibilitychange', checkForUpdate);
  setInterval(checkForUpdate, 30 * 60 * 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdateBanner />
  </StrictMode>,
)
