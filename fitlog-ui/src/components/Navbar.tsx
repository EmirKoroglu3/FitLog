import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">💪</span>
          <span className="logo-text">FitLog</span>
        </Link>

        {isAuthenticated && (
          <div className="navbar-links">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              📊 Dashboard
            </Link>
            <Link to="/workouts" className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}>
              🏋️ Antrenmanlar
            </Link>
            <Link to="/workout-mode" className={`nav-link workout-mode-link ${isActive('/workout-mode') ? 'active' : ''}`}>
              ⏱️ Başlat
            </Link>
            <Link to="/calendar" className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}>
              📅 Takvim
            </Link>
            <Link to="/nutrition" className={`nav-link ${isActive('/nutrition') ? 'active' : ''}`}>
              🥗 Beslenme
            </Link>
            
            {/* Daha Fazla Dropdown */}
            <div className="nav-dropdown">
              <button 
                className={`nav-link dropdown-trigger ${showMoreMenu ? 'open' : ''}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                ⋯ Daha Fazla
              </button>
              {showMoreMenu && (
                <div className="dropdown-menu" onClick={() => setShowMoreMenu(false)}>
                  <Link to="/supplements" className={`dropdown-item ${isActive('/supplements') ? 'active' : ''}`}>
                    💊 Takviyeler
                  </Link>
                  <Link to="/body-tracking" className={`dropdown-item ${isActive('/body-tracking') ? 'active' : ''}`}>
                    📏 Vücut Ölçüleri
                  </Link>
                  <Link to="/goals" className={`dropdown-item ${isActive('/goals') ? 'active' : ''}`}>
                    🎯 Hedefler
                  </Link>
                  <Link to="/achievements" className={`dropdown-item ${isActive('/achievements') ? 'active' : ''}`}>
                    🏆 Başarılar
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/settings" className={`dropdown-item ${isActive('/settings') ? 'active' : ''}`}>
                    ⚙️ Ayarlar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className={`profile-link ${isActive('/profile') ? 'active' : ''}`}>
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">
                Giriş Yap
              </Link>
              <Link to="/register" className="btn-primary">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

