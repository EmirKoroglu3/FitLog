import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  Dumbbell,
  Flame,
  Pill,
  Ruler,
  Timer,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { Logo } from '../components/Navbar';
import { useI18n } from '../i18n/I18nContext';
import './Home.css';

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

const features: Feature[] = [
  {
    icon: Dumbbell,
    title: 'Antrenman Programları',
    text: 'Haftalık programını kur ya da hazır şablonlardan (PPL, Full Body, Upper/Lower) birini seçip düzenle.',
  },
  {
    icon: Timer,
    title: 'Canlı Antrenman Modu',
    text: 'Set set ilerle, dinlenme sayacı otomatik başlasın, antrenman sonunda özetini gör.',
  },
  {
    icon: Utensils,
    title: 'Beslenme Takibi',
    text: 'Hazır yiyecek veritabanından öğün ekle; kalori, protein, karbonhidrat ve yağı anında hesapla.',
  },
  {
    icon: Pill,
    title: 'Takviye Takibi',
    text: 'Kreatin, protein, vitamin… Dozajı ve kullanım zamanını kaydet, hiçbirini unutma.',
  },
  {
    icon: Ruler,
    title: 'Vücut & Hedefler',
    text: 'Ölçülerini ve su tüketimini takip et, hedef koy, 1RM hesaplayıcıyla gücünü ölç.',
  },
  {
    icon: Bot,
    title: 'AI Koç',
    text: 'Antrenman geçmişini analiz eden koç; progressive overload ve plato uyarıları verir.',
  },
];

const steps = [
  { title: 'Hesabını oluştur', text: 'Ücretsiz kayıt ol, profilinde boy, kilo ve hedefini belirle.' },
  { title: 'Programını kur', text: 'Şablon seç ya da kendi haftalık programını oluştur.' },
  { title: 'Takip et, geliş', text: 'Antrenman ve öğünlerini kaydet, ilerlemeni takvimde gör.' },
];

function AppPreview() {
  const { t } = useI18n();
  const macros = [
    { label: t("Protein"), value: 128, goal: 160, cls: 'm-protein' },
    { label: t("Karbonhidrat"), value: 190, goal: 260, cls: 'm-carb' },
    { label: t("Yağ"), value: 52, goal: 70, cls: 'm-fat' },
  ];
  const sets = [
    { name: 'Bench Press', detail: '4 × 8 · 80 kg', done: true },
    { name: 'Incline DB Press', detail: '3 × 10 · 28 kg', done: true },
    { name: 'Cable Fly', detail: '3 × 12 · 15 kg', done: false },
  ];

  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-card preview-main">
        <div className="preview-head">
          <div>
            <span className="eyebrow">Bugün · Push Day</span>
            <h3>Göğüs & Omuz</h3>
          </div>
          <span className="preview-timer">
            <Timer size={16} /> 42:18
          </span>
        </div>
        <ul className="preview-sets">
          {sets.map((s) => (
            <li key={s.name} className={s.done ? 'done' : ''}>
              <span className="set-check">{s.done ? <Check size={14} strokeWidth={3} /> : null}</span>
              <span className="set-name">{s.name}</span>
              <span className="set-detail">{s.detail}</span>
            </li>
          ))}
        </ul>
        <div className="preview-progress">
          <span>Antrenman ilerlemesi</span>
          <span>%67</span>
        </div>
        <div className="bar">
          <span style={{ width: '67%' }} />
        </div>
      </div>

      <div className="preview-card preview-side">
        <div className="kcal">
          <span className="kcal-icon">
            <Flame size={18} />
          </span>
          <div>
            <strong>1.840</strong>
            <span> / 2.400 kcal</span>
          </div>
        </div>
        {macros.map((m) => (
          <div key={m.label} className="macro">
            <div className="macro-row">
              <span>{m.label}</span>
              <span>
                {m.value}g <em>/ {m.goal}g</em>
              </span>
            </div>
            <div className={`bar ${m.cls}`}>
              <span style={{ width: `${Math.round((m.value / m.goal) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="preview-card preview-streak">
        <CalendarDays size={18} />
        <div>
          <strong>12 gün</strong>
          <span>seri</span>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy animate-slideUp">
            <span className="hero-badge">{t("Antrenman · Beslenme · Takviye")}</span>
            <h1>
              {t("Her seti, her öğünü")}
              <br />
              <span className="accent">{t("tek yerden takip et.")}</span>
            </h1>
            <p>
              {t('FitLog; antrenman programlarını, canlı antrenman takibini, beslenme ve takviye kayıtlarını bir araya getirir. Ne yaptığını gör, gelişimini ölç.')}
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary btn-lg">
                  {t("Panele Git")} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary btn-lg">
                    {t("Ücretsiz Başla")} <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link to="/login" className="btn-secondary btn-lg">
                    {t("Giriş Yap")}
                  </Link>
                </>
              )}
            </div>
            <ul className="hero-points">
              <li>
                <Check size={16} aria-hidden="true" /> {t("Tamamen ücretsiz")}
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> {t("Hazır programlar")}
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> {t("Açık & koyu tema")}
              </li>
            </ul>
          </div>
          <AppPreview />
        </div>
      </section>

      {/* Features */}
      <section className="features" id="ozellikler">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("Özellikler")}</span>
            <h2>{t("İhtiyacın olan her şey, tek uygulamada")}</h2>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t("Nasıl çalışır?")}</span>
            <h2>{t("3 adımda başla")}</h2>
          </div>
          <ol className="steps-grid">
            {steps.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t(s.title)}</h3>
                <p>{t(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="cta">
          <div className="container">
            <div className="cta-band">
              <div>
                <h2>{t("Bugün ilk antrenmanını kaydet.")}</h2>
                <p>{t("Kayıt olmak bir dakikanı alır.")}</p>
              </div>
              <Link to="/register" className="btn-primary btn-lg">
                {t("Hemen Kayıt Ol")} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="site-footer">
        <div className="container footer-inner">
          <Logo />
          <p>
            © {new Date().getFullYear()} FitLog · ASP.NET Core & React ile geliştirildi ·{' '}
            <a href="https://github.com/EmirKoroglu3/FitLog" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
