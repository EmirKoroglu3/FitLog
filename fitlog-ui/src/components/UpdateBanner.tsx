import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import './UpdateBanner.css';

/** Shown when a newer build is deployed; the user reloads when it suits them (no lost forms or workouts). */
export function UpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('fitlog:update-available', show);
    return () => window.removeEventListener('fitlog:update-available', show);
  }, []);

  if (!visible) return null;

  return (
    <div className="update-banner" role="status">
      <span>Yeni sürüm hazır</span>
      <button type="button" className="update-banner-reload" onClick={() => window.location.reload()}>
        <RefreshCw size={15} aria-hidden="true" /> Yenile
      </button>
      <button type="button" className="update-banner-close" aria-label="Kapat" onClick={() => setVisible(false)}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default UpdateBanner;
