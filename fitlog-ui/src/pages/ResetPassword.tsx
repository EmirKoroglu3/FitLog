import { useState, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Auth.css';
import apiClient from '../api/client';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!userId || !token) {
      setError('Geçersiz veya eksik şifre sıfırlama bağlantısı.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        userId,
        token,
        newPassword: password,
        confirmPassword,
      });

      if (response.data?.success) {
        setMessage('Şifren başarıyla güncellendi. Şimdi giriş yapabilirsin.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(response.data?.message || 'Şifre sıfırlama başarısız.');
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message as string | undefined;
      setError(apiMessage || 'Şifre sıfırlama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <div className="auth-header">
          <h1>Şifreyi Sıfırla</h1>
          <p>Yeni şifreni belirle.</p>
        </div>

        {message && (
          <div
            className="error-message"
            style={{
              borderColor: 'var(--color-accent-success)',
              color: 'var(--color-accent-success)',
              background: 'rgba(34,197,94,0.08)',
            }}
          >
            {message}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Yeni Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Şifre güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
