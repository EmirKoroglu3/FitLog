import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import './Auth.css';
import { Play } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export function Register() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t("Şifreler eşleşmiyor"));
      return;
    }

    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Kayıt başarısız');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <div className="auth-header">
          <h1>{t("Hesap Oluştur")} <Play size="1em" aria-hidden="true" /></h1>
          <p>{t("FitLog'a katıl ve fitness yolculuğuna başla")}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t("İsim")}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("İsminiz")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="surname">{t("Soyisim")}</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder={t("Soyisminiz")}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <span className="form-hint">{t("En az 6 karakter, büyük harf, küçük harf ve rakam içermeli")}</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t("Şifre Tekrar")}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t("Kayıt yapılıyor...") : t("Kayıt Ol")}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t("Zaten hesabın var mı?")}{' '}
            <Link to="/login">{t("Giriş Yap")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

