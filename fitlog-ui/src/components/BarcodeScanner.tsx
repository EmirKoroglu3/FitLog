import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Loader2, ScanBarcode, X } from 'lucide-react';
import { lookupBarcode, type ScannedProduct } from '../utils/openFoodFacts';
import './BarcodeScanner.css';

interface Props {
  onFound: (product: ScannedProduct) => void;
  onClose: () => void;
}

// Minimal typing for the (not yet standard) BarcodeDetector API
type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (opts: { formats: string[] }) => Detector;
const BarcodeDetectorCtor = (globalThis as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;

/**
 * Scan a product barcode with the camera (where the browser supports BarcodeDetector)
 * or type the number, then look it up in Open Food Facts.
 */
export function BarcodeScanner({ onFound, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'camera' | 'looking' | 'notfound' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // Native BarcodeDetector (Android Chrome) or the zxing fallback (iPhone Safari etc.) — both need a camera
  const cameraSupported = !!navigator.mediaDevices?.getUserMedia;

  const lookup = async (value: string) => {
    setStatus('looking');
    setMessage('');
    try {
      const product = await lookupBarcode(value);
      if (product) {
        onFound(product);
      } else {
        setStatus('notfound');
        setMessage('Bu barkod veritabanında yok ya da besin değeri girilmemiş. Kendi Yiyeceklerim\'den elle ekleyebilirsin.');
      }
    } catch {
      setStatus('error');
      setMessage('Ürün bilgisi alınamadı. İnternet bağlantını kontrol et.');
    }
  };

  // Fallback for browsers without BarcodeDetector (iPhone Safari): zxing, loaded only when needed
  useEffect(() => {
    if (status !== 'camera' || BarcodeDetectorCtor) return;
    let controls: { stop: () => void } | null = null;
    let stopped = false;

    import('@zxing/browser')
      .then(async ({ BrowserMultiFormatReader }) => {
        if (stopped || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' }, audio: false },
          videoRef.current,
          (result, _err, ctl) => {
            if (!result || stopped) return;
            stopped = true;
            ctl.stop();
            const value = result.getText();
            setCode(value);
            lookup(value);
          },
        );
        if (stopped) controls.stop();
      })
      .catch(() => {
        setStatus('error');
        setMessage('Kameraya erişilemedi. İzin vermediysen tarayıcı ayarlarından izin ver ya da numarayı elle yaz.');
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Camera loop with the native BarcodeDetector: look for a barcode a few times a second
  useEffect(() => {
    if (status !== 'camera' || !BarcodeDetectorCtor) return;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let stopped = false;
    const detector = new BarcodeDetectorCtor({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        video.play().catch(() => {});
        const tick = async () => {
          if (stopped || !video.videoWidth) {
            timer = window.setTimeout(tick, 250);
            return;
          }
          try {
            const found = await detector.detect(video);
            if (found[0]?.rawValue) {
              stopped = true;
              setCode(found[0].rawValue);
              stream?.getTracks().forEach((t) => t.stop());
              lookup(found[0].rawValue);
              return;
            }
          } catch {
            /* frame not ready */
          }
          timer = window.setTimeout(tick, 300);
        };
        tick();
      })
      .catch(() => {
        setStatus('error');
        setMessage('Kameraya erişilemedi. İzin vermediysen tarayıcı ayarlarından izin ver ya da numarayı elle yaz.');
      });

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return createPortal(
    <div className="barcode-overlay" onClick={onClose}>
      <div className="barcode-dialog" role="dialog" aria-modal="true" aria-labelledby="barcode-title" onClick={(e) => e.stopPropagation()}>
        <div className="barcode-head">
          <h3 id="barcode-title">
            <ScanBarcode size={20} aria-hidden="true" /> Barkod ile ekle
          </h3>
          <button type="button" className="barcode-close" onClick={onClose} aria-label="Kapat">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {status === 'camera' ? (
          <div className="barcode-video">
            <video ref={videoRef} playsInline muted />
            <span className="barcode-frame" aria-hidden="true" />
            <p>Barkodu çerçevenin içine getir</p>
          </div>
        ) : cameraSupported ? (
          <button type="button" className="btn-primary barcode-camera-btn" onClick={() => setStatus('camera')}>
            <Camera size={18} aria-hidden="true" /> Kamerayla okut
          </button>
        ) : (
          <p className="barcode-note">Bu tarayıcı kamerayla barkod okumayı desteklemiyor; ürünün arkasındaki numarayı yaz.</p>
        )}

        <form
          className="barcode-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) lookup(code);
          }}
        >
          <label htmlFor="barcode-input">Barkod numarası</label>
          <div>
            <input
              id="barcode-input"
              inputMode="numeric"
              pattern="[0-9 ]*"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Örn: 8690504012345"
              autoComplete="off"
            />
            <button type="submit" className="btn-secondary" disabled={status === 'looking' || code.replace(/\D/g, '').length < 8}>
              {status === 'looking' ? <Loader2 size={16} className="spin" aria-hidden="true" /> : 'Ara'}
            </button>
          </div>
        </form>

        {message && (
          <p className={`barcode-msg ${status}`} role="status">
            {message}
          </p>
        )}
        <p className="barcode-credit">Ürün bilgileri Open Food Facts'ten gelir; sadece barkod numarası gönderilir.</p>
      </div>
    </div>,
    document.body,
  );
}

export default BarcodeScanner;
