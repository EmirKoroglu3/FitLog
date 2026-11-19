import { useEffect, useState } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import './InstallPrompt.css';

/** Chrome's install event (not in the TS DOM lib). */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    /** Captured in main.tsx: the event can fire before this card mounts. */
    __fitlogInstallEvent?: InstallPromptEvent | null;
  }
}

const DISMISS_KEY = 'fitlog.installDismissedAt';
const DISMISS_DAYS = 30;

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS reports itself as a Mac
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isAndroid = () => /android/i.test(navigator.userAgent);

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/**
 * "Add FitLog to your home screen" card: Chrome/Android gets the real install button,
 * iPhone gets the Safari Share → Add to Home Screen steps. Hidden once installed or
 * for 30 days after closing.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(() => window.__fitlogInstallEvent ?? null);
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed());

  useEffect(() => {
    const onReady = () => setEvent(window.__fitlogInstallEvent ?? null);
    const onInstalled = () => setHidden(true);
    window.addEventListener('fitlog:install-available', onReady);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('fitlog:install-available', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode: just hide for this visit */
    }
  };

  const install = async () => {
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    window.__fitlogInstallEvent = null;
    setEvent(null);
    if (outcome === 'accepted') setHidden(true);
  };

  if (hidden) return null;
  const ios = isIOS();
  // Nothing useful to offer on desktop browsers without an install event
  if (!event && !ios && !isAndroid()) return null;

  return (
    <section className="install-card card" aria-label="FitLog'u ana ekrana ekle">
      <button type="button" className="install-close" onClick={dismiss} aria-label="Kapat">
        <X size={16} aria-hidden="true" />
      </button>
      <img src="/icon-192.png" alt="" className="install-icon" width={48} height={48} />
      <div className="install-body">
        <strong>FitLog'u uygulama gibi kullan</strong>
        {event ? (
          <>
            <p>Ana ekrana ekle: tam ekran açılır, internet yokken de antrenmanını kaydedersin.</p>
            <button type="button" className="btn-primary install-btn" onClick={install}>
              <Download size={16} aria-hidden="true" /> Uygulamayı yükle
            </button>
          </>
        ) : ios ? (
          <ol className="install-steps">
            <li>
              Safari'de alttaki <Share size={15} aria-label="Paylaş" /> <b>Paylaş</b> butonuna dokun
            </li>
            <li>
              <SquarePlus size={15} aria-hidden="true" /> <b>Ana Ekrana Ekle</b>'yi seç
            </li>
            <li>
              Sağ üstte <b>Ekle</b>'ye dokun
            </li>
          </ol>
        ) : (
          <p>
            Tarayıcı menüsünden (⋮) <b>Ana ekrana ekle</b> ya da <b>Uygulamayı yükle</b>'yi seç.
          </p>
        )}
      </div>
    </section>
  );
}

export default InstallPrompt;
