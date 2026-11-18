import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useSettings } from '../store/SettingsContext';
import './OnboardingTour.css';

interface Step {
  title: string;
  text: string;
  /** Elements to point at, first visible one wins (desktop link → phone menu button). */
  targets?: string[];
  /** Extra line when the step falls back to the phone's ☰ menu. */
  phoneHint?: string;
}

const NAV = (href: string) => [`.navbar-links a[href="${href}"]`, '.mobile-toggle'];

const STEPS: Step[] = [
  {
    title: "FitLog'a hoş geldin! 👋",
    text: 'Antrenman, beslenme ve gelişimini tek yerden takip edeceksin. 1 dakikada nereden ne yapılır gösterelim.',
  },
  {
    title: 'Panel',
    text: 'Günün özeti: aldığın kalori ve makrolar, yaktığın kalori, içtiğin su ve takviyelerin. Su ve takviyeyi buradan tek dokunuşla işaretleyebilirsin.',
    targets: NAV('/dashboard'),
    phoneHint: 'Telefonda sayfalar sağ üstteki ☰ menüde.',
  },
  {
    title: 'Antrenmanlar',
    text: 'Hazır şablonlardan (PPL, Full Body, kalça odaklı…) program seç ya da kendin yaz. Hareketleri sürükleyerek sırala; vücut haritası hangi kası ne kadar çalıştırdığını gösterir.',
    targets: NAV('/workouts'),
    phoneHint: 'Telefonda ☰ menü → Antrenmanlar.',
  },
  {
    title: 'Antrenmanı başlat',
    text: 'Salonda buradan başla: setlerini kaydet, dinlenme sayacı otomatik çalışır, geçen seferki ağırlığa göre öneri alırsın.',
    targets: ['.navbar .start-btn', '.navbar-links a[href="/workouts"]', '.mobile-toggle'],
    phoneHint: 'Telefonda ☰ menüdeki "Antrenman Başlat" butonu.',
  },
  {
    title: 'Takvim',
    text: 'Hangi gün ne yaptığını ve sıradaki antrenmanını gör. Kardiyo (yürüyüş, koşu, bisiklet) kayıtlarını da buradan ekleyebilirsin.',
    targets: NAV('/calendar'),
    phoneHint: 'Telefonda ☰ menü → Takvim.',
  },
  {
    title: 'Beslenme',
    text: 'Öğün ekle: ara, kategorilerden seç, barkod okut ya da sık yediğin öğünü şablon yap. Günün sonunda kalan kalori ve proteine göre öneri alırsın.',
    targets: NAV('/nutrition'),
    phoneHint: 'Telefonda ☰ menü → Beslenme.',
  },
  {
    title: 'İlerleme',
    text: 'Hareket bazında güç grafiğin, kişisel rekorların, haftalık hacmin ve kilo trendin burada.',
    targets: NAV('/progress'),
    phoneHint: 'Telefonda ☰ menü → İlerleme.',
  },
  {
    title: 'Daha fazlası',
    text: 'Takviyeler, vücut ölçüleri (yağ oranı otomatik hesaplanır), hedefler, AI Koç ve başarılar bu menüde.',
    targets: ['.nav-dropdown .dropdown-trigger', '.mobile-toggle'],
    phoneHint: 'Telefonda hepsi ☰ menüde.',
  },
  {
    title: 'Profil ve ayarlar',
    text: 'Boy, kilo ve hedefini gir: kalori ve protein hedeflerin buna göre hesaplanır. Birim, dil ve tema ayarları da burada.',
    targets: ['.avatar-link'],
  },
  {
    title: 'Hazırsın! 💪',
    text: 'Önerimiz: önce profilini doldur, sonra bir program seç. Bu turu istediğin zaman Ayarlar\'dan tekrar açabilirsin.',
  },
];

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const CARD_W = 340;

function visible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

/** First-run guided tour: small cards that point at each part of the app. Shown once per account. */
export function OnboardingTour() {
  const { isAuthenticated } = useAuth();
  const { settings, loaded, update } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(false);

  const active =
    isAuthenticated &&
    loaded &&
    !settings.onboardingDone &&
    !closed &&
    !PUBLIC_PATHS.includes(location.pathname) &&
    location.pathname !== '/workout-mode';

  // Replaying from Settings resets the flag: start from the first card again
  useEffect(() => {
    if (!settings.onboardingDone) {
      setClosed(false);
      setIndex(0);
    }
  }, [settings.onboardingDone]);

  const step = STEPS[index];

  const measure = useCallback(() => {
    if (!step.targets) {
      setRect(null);
      setUsedFallback(false);
      return;
    }
    const found = step.targets.map((s) => document.querySelector(s)).find(visible) ?? null;
    setRect(found ? found.getBoundingClientRect() : null);
    setUsedFallback(!!found && found.classList.contains('mobile-toggle'));
  }, [step]);

  useLayoutEffect(() => {
    if (!active) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  useEffect(() => {
    if (active) cardRef.current?.querySelector<HTMLButtonElement>('.tour-next')?.focus();
  }, [active, index]);

  const finish = useCallback(
    (goTo?: string) => {
      setClosed(true);
      update({ onboardingDone: true }).catch(() => {});
      if (goTo) navigate(goTo);
    },
    [update, navigate],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' && index < STEPS.length - 1) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, index, finish]);

  if (!active) return null;

  const last = index === STEPS.length - 1;
  const pad = 6;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 24);

  // Card below the highlighted element (or above when there's no room), centred when no target
  let cardStyle: CSSProperties = { width: cardW };
  if (rect) {
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 12);
    const below = rect.bottom + pad + 12;
    cardStyle = below + 220 < vh ? { ...cardStyle, left, top: below } : { ...cardStyle, left, bottom: vh - rect.top + pad + 12 };
  }

  return createPortal(
    <div className="tour-root" role="presentation">
      {rect ? (
        <div
          className="tour-spotlight"
          style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          aria-hidden="true"
        />
      ) : (
        <div className="tour-backdrop" aria-hidden="true" />
      )}

      <div
        ref={cardRef}
        className={`tour-card ${rect ? 'anchored' : 'centered'}`}
        style={cardStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
      >
        <div className="tour-head">
          <span className="tour-step">
            <Sparkles size={14} aria-hidden="true" /> {index + 1} / {STEPS.length}
          </span>
          <button type="button" className="tour-skip" onClick={() => finish()} aria-label="Turu kapat">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <h3 id="tour-title">{step.title}</h3>
        <p id="tour-text">{step.text}</p>
        {usedFallback && step.phoneHint && <p className="tour-hint">{step.phoneHint}</p>}

        <div className="tour-dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={i === index ? 'on' : ''} />
          ))}
        </div>

        <div className="tour-actions">
          {index === 0 ? (
            <button type="button" className="btn-secondary" onClick={() => finish()}>
              Atla
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={() => setIndex((i) => i - 1)}>
              <ArrowLeft size={16} aria-hidden="true" /> Geri
            </button>
          )}
          {last ? (
            <div className="tour-final">
              <button type="button" className="btn-secondary" onClick={() => finish('/workouts')}>
                Program seç
              </button>
              <button type="button" className="btn-primary tour-next" onClick={() => finish('/profile')}>
                Profili doldur
              </button>
            </div>
          ) : (
            <button type="button" className="btn-primary tour-next" onClick={() => setIndex((i) => i + 1)}>
              {index === 0 ? 'Başlayalım' : 'İleri'} <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default OnboardingTour;
