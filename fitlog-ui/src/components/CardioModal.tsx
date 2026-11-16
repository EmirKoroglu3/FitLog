import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { sessionsApi } from '../services/trackingService';
import { localInputsToIso, toLocalDateInput, toLocalTimeInput } from '../utils/dateTime';

const ACTIVITIES = ['Koşu', 'Yürüyüş', 'Bisiklet', 'Yüzme', 'Kürek', 'Eliptik', 'İp Atlama', 'Merdiven', 'HIIT', 'Diğer'];

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

/** Pace in min/km for distance-based activities, e.g. "5:42 /km". */
export function formatPace(durationMin: number, distanceKm: number) {
  if (!durationMin || !distanceKm) return null;
  const secPerKm = (durationMin * 60) / distanceKm;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

export function CardioModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    activity: 'Koşu',
    date: toLocalDateInput(),
    time: toLocalTimeInput(),
    minutes: '30',
    distance: '',
    heartRate: '',
    calories: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = (v: string) => (v.trim() === '' ? null : Number(v.replace(',', '.')));
  const minutes = num(form.minutes) ?? 0;
  const distance = num(form.distance);
  const pace = distance ? formatPace(minutes, distance) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) {
      setError('Süre girmelisin.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const start = localInputsToIso(form.date, form.time);
      await sessionsApi.create({
        name: form.activity,
        type: 'cardio',
        cardioActivity: form.activity,
        startedAt: start,
        endedAt: new Date(new Date(start).getTime() + minutes * 60000).toISOString(),
        durationSeconds: Math.round(minutes * 60),
        distanceKm: distance,
        averageHeartRate: num(form.heartRate),
        caloriesBurned: num(form.calories),
        notes: form.notes || null,
        sets: [],
      });
      onSaved?.();
      onClose();
    } catch {
      setError('Kaydedilemedi. Değerleri kontrol et (nabız 30–250).');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="cardio-title">
        <div className="modal-header">
          <h2 id="cardio-title">
            <HeartPulse size="1em" aria-hidden="true" /> Kardiyo Kaydet
          </h2>
          <button type="button" onClick={onClose} aria-label="Kapat">×</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="c-activity">Aktivite</label>
            <select id="c-activity" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}>
              {ACTIVITIES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="c-date">Tarih</label>
              <input id="c-date" type="date" max={toLocalDateInput()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="c-time">Başlangıç</label>
              <input id="c-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="c-min">Süre (dk)</label>
              <input id="c-min" type="number" min="1" max="1440" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="c-dist">Mesafe (km)</label>
              <input id="c-dist" type="number" min="0" step="0.01" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="ops." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="c-hr">Ort. nabız</label>
              <input id="c-hr" type="number" min="30" max="250" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} placeholder="ops." />
            </div>
            <div className="form-group">
              <label htmlFor="c-kcal">Yakılan kcal</label>
              <input id="c-kcal" type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="ops." />
            </div>
          </div>
          {pace && (
            <p style={{ color: 'var(--text-2)', marginBottom: '0.75rem' }}>
              Tempo: <strong style={{ color: 'var(--text)' }}>{pace}</strong>
            </p>
          )}
          <div className="form-group">
            <label htmlFor="c-notes">Not</label>
            <input id="c-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={300} placeholder="Örn: sahil yolu, hafif tempo" />
          </div>
          {error && <p className="error-banner" role="alert">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
