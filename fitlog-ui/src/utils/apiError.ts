import axios from 'axios';

/**
 * Turns an API/network error into a sentence for the user.
 * Prefers the API's own message (e.g. "Email veya şifre hatalı."), never axios'
 * technical text like "Request failed with status code 401".
 */
export function apiErrorMessage(error: unknown, fallback = 'Bir hata oluştu, tekrar dene.'): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as { message?: string; errors?: string[] } | undefined;
  const status = error.response?.status;

  if (!error.response) {
    // No answer at all: offline, or the free Render instance is still waking up
    return navigator.onLine
      ? 'Sunucuya ulaşılamadı. Sunucu uyanıyor olabilir, birkaç saniye sonra tekrar dene.'
      : 'İnternet bağlantın yok gibi görünüyor.';
  }
  if (status === 429) return 'Çok fazla deneme yaptın. Bir dakika bekleyip tekrar dene.';

  const details = data?.errors?.filter(Boolean) ?? [];
  if (data?.message && details.length && status === 400) return `${data.message} ${details.join(' ')}`;
  if (data?.message) return data.message;
  if (details.length) return details.join(' ');

  if (status === 401) return 'Email veya şifre hatalı.';
  if (status && status >= 500) return 'Sunucuda bir sorun oluştu. Biraz sonra tekrar dene.';
  return fallback;
}
