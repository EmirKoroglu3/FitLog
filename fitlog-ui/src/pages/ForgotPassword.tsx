import { useState, FormEvent } from 'react';
import './Auth.css';
import authService from '../services/authService';

export function ForgotPassword() {
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
      setMessage(
        response.message ||
          'Eğer bu email ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi.'
      );
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
          <h1>Şifremi Unuttum</h1>
          <p>Hesabına ait email adresini gir, sana şifre sıfırlama bağlantısı gönderelim.</p>
        </div>

        {message && <div className="error-message" style={{ borderColor: 'var(--color-accent-success)', color: 'var(--color-accent-success)', background: 'rgba(34,197,94,0.08)' }}>{message}</div>}
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
