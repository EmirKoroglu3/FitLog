import { useState, FormEvent } from 'react';
import './Auth.css';
import authService from '../services/authService';
import { useI18n } from '../i18n/I18nContext';

export function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success === false) {
        setError(response.message || 'Şifre sıfırlama e-postası gönderilemedi.');
      } else {
        setMessage(
          response.message ||
            'Eğer bu email ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi.'
        );
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message as string | undefined;
      setError(apiMessage || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <div className="auth-header">
          <h1>{t("Şifremi Unuttum")}</h1>
          <p>{t("Hesabına ait email adresini gir, sana şifre sıfırlama bağlantısı gönderelim.")}</p>
        </div>

        {message && <div className="success-banner" role="status">{message}</div>}
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

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
