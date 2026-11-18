import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Pill,
  Play,
  Ruler,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useSettings } from '../store/SettingsContext';
import './Navbar.css';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const primaryLinks: NavItem[] = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/workouts', label: 'Antrenmanlar', icon: Dumbbell },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/progress', label: 'İlerleme', icon: TrendingUp },
  { to: '/nutrition', label: 'Beslenme', icon: Utensils },
];

const moreLinks: NavItem[] = [
  { to: '/supplements', label: 'Takviyeler', icon: Pill },
  { to: '/body-tracking', label: 'Vücut Ölçüleri', icon: Ruler },
  { to: '/goals', label: 'Hedefler', icon: Target },
  { to: '/coach', label: 'AI Koç', icon: Bot },
  { to: '/achievements', label: 'Başarılar', icon: Trophy },
];

export function Logo() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Activity size={18} strokeWidth={2.75} />
      </span>
      {/* lang="en" so the uppercase transform gives "FITLOG", not Turkish "FİTLOG" */}
      <span className="brand-text" lang="en">FitLog</span>
    </span>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  // Admin link only for admins (the API enforces the role either way)
  const visibleMoreLinks: NavItem[] = user?.isAdmin ? [...moreLinks, { to: '/admin', label: 'Yönetim', icon: ShieldCheck }] : moreLinks;
  const { resolved, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { update: updateSettings } = useSettings();
  const switchLang = () => {
    const next = lang === 'tr' ? 'en' : 'tr';
    setLang(next);
    if (isAuthenticated) updateSettings({ language: next }).catch(() => {});
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close "more" dropdown on outside click / Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const moreActive = visibleMoreLinks.some((l) => location.pathname === l.to) || location.pathname === '/settings';
  const themeLabel = t(resolved === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');

  const themeButton = (
    <>
      <button className="icon-btn lang-btn" onClick={switchLang} aria-label={lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'} title={lang === 'tr' ? 'English' : 'Türkçe'}>
        {lang === 'tr' ? 'EN' : 'TR'}
      </button>
      <button className="icon-btn" onClick={toggle} aria-label={themeLabel} title={themeLabel}>
        {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo" aria-label="FitLog ana sayfa">
          <Logo />
        </Link>

        {isAuthenticated && (
          <nav className="navbar-links" aria-label={t('Ana menü')}>
            {primaryLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={17} aria-hidden="true" />
                {t(label)}
              </NavLink>
            ))}

            <div className="nav-dropdown" ref={moreRef}>
              <button
                className={`nav-link dropdown-trigger ${moreActive ? 'active' : ''}`}
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                {t('Daha Fazla')}
                <ChevronDown size={16} className={`chevron ${moreOpen ? 'open' : ''}`} aria-hidden="true" />
              </button>
              {moreOpen && (
                <div className="dropdown-menu" role="menu">
                  {visibleMoreLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      role="menuitem"
                      className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {t(label)}
                    </NavLink>
                  ))}
                  <div className="dropdown-divider" />
                  <NavLink
                    to="/settings"
                    role="menuitem"
                    className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  >
                    <Settings size={17} aria-hidden="true" />
                    {t('Ayarlar')}
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        )}

        <div className="navbar-right">
          {themeButton}
          {isAuthenticated ? (
            <>
              <Link to="/workout-mode" className="btn-primary start-btn">
                <Play size={16} fill="currentColor" aria-hidden="true" />
                {t('Antrenmana Başla')}
              </Link>
              <Link to="/profile" className="avatar-link" aria-label="Profil" title={user?.name ?? 'Profil'}>
                <span className="avatar">{(user?.name?.[0] ?? '?').toLocaleUpperCase('tr-TR')}</span>
              </Link>
              <button onClick={handleLogout} className="icon-btn logout-btn" aria-label={t('Çıkış yap')} title={t('Çıkış yap')}>
                <LogOut size={18} />
              </button>
              <button
                className="icon-btn mobile-toggle"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={t(mobileOpen ? 'Menüyü kapat' : 'Menüyü aç')}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">
                {t('Giriş Yap')}
              </Link>
              <Link to="/register" className="btn-primary">
                {t('Ücretsiz Başla')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && mobileOpen && (
        <nav className="mobile-menu" aria-label="Mobil menü">
          <Link to="/workout-mode" className="btn-primary mobile-start">
            <Play size={16} fill="currentColor" aria-hidden="true" />
            {t('Antrenmana Başla')}
          </Link>
          {[...primaryLinks, ...visibleMoreLinks, { to: '/settings', label: 'Ayarlar', icon: Settings }, { to: '/profile', label: 'Profil', icon: UserRound }].map(
            ({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
                <Icon size={18} aria-hidden="true" />
                {t(label)}
              </NavLink>
            ),
          )}
          <button className="mobile-link logout" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            {t('Çıkış Yap')}
          </button>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
