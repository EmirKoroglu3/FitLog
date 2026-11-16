import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import './Auth.css';
import { Hand } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Giriş başarısız');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <div className="auth-header">
          <h1>{t("Hoş Geldin")} <Hand size="1em" aria-hidden="true" /></h1>
          <p>{t("Hesabına giriş yap ve antrenmanlarını takip et")}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("Şifre")}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t("Giriş yapılıyor...") : t("Giriş Yap")}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t("Şifreni mi unuttun?")}{' '}
            <Link to="/forgot-password">{t("Şifremi Unuttum")}</Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            {t("Hesabın yok mu?")}{' '}
            <Link to="/register">{t("Kayıt Ol")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

