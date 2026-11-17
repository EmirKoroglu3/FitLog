import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Flame, HeartPulse, Info } from 'lucide-react';
import { bodyApi, sessionsApi, type WorkoutSession } from '../services/trackingService';
import profileService from '../services/profileService';
import { localDayRange } from '../utils/dateTime';
import { DEFAULT_WEIGHT_KG, estimateSessionKcal } from '../utils/calorieEstimate';
import { formatNumber } from '../utils/units';
import './BurnCard.css';

interface Props {
  /** Calories eaten today (from the nutrition summary), to show the balance. */
  caloriesIn?: number;
}

const describe = (s: WorkoutSession) => {
  const min = Math.round(s.durationSeconds / 60);
  if (s.type === 'cardio') {
    const parts = [`${min} dk`];
    if (s.speedKmh) parts.push(`${formatNumber(s.speedKmh, 1)} km/s`);
    if (s.inclinePercent) parts.push(`%${formatNumber(s.inclinePercent, 1)} eğim`);
    else if (s.distanceKm) parts.push(`${formatNumber(s.distanceKm, 2)} km`);
    return parts.join(' · ');
  }
  return min > 0 ? `${min} dk ağırlık · ${s.setCount} set` : `${s.setCount} set`;
};

/** Today's estimated calories burned from logged sessions (strength + cardio). */
export function BurnCard({ caloriesIn }: Props) {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const [weight, setWeight] = useState<{ kg: number; source: 'measurement' | 'profile' | 'default' }>({
    kg: DEFAULT_WEIGHT_KG,
    source: 'default',
  });

  useEffect(() => {
    const { start, end } = localDayRange();
    Promise.all([
      sessionsApi.list({ from: start, to: end }),
      bodyApi.measurements().catch(() => []),
      profileService.getProfile().catch(() => null),
    ])
      .then(([today, measurements, profile]) => {
        setSessions(today);
        const latest = measurements.find((m) => m.weightKg != null)?.weightKg; // newest first
        if (latest) setWeight({ kg: latest, source: 'measurement' });
        else if (profile?.weight) setWeight({ kg: profile.weight, source: 'profile' });
      })
      .catch(() => setSessions([]));
  }, []);

  if (sessions === null) return null;

  const items = [...sessions]
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((s) => ({ s, ...estimateSessionKcal(s, weight.kg) }));
  const total = items.reduce((sum, i) => sum + i.kcal, 0);
  const net = caloriesIn != null ? caloriesIn - total : null;

  return (
    <section className="burn-card card" aria-label="Bugün yakılan kalori">
      <div className="burn-head">
        <div>
          <span className="burn-label">Bugün yakılan (tahmini)</span>
          <strong className="burn-total">
            <Flame size="0.8em" aria-hidden="true" /> {formatNumber(total)} <small>kcal</small>
          </strong>
        </div>
        {net != null && total > 0 && (
          <div className="burn-balance">
            <span>Alınan {formatNumber(caloriesIn!)} − yakılan {formatNumber(total)}</span>
            <strong>Net {formatNumber(net)} kcal</strong>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="burn-empty">
          Bugün henüz antrenman ya da kardiyo kaydı yok. <Link to="/workout-mode">Antrenmana başla</Link>
        </p>
      ) : (
        <ul className="burn-list">
          {items.map(({ s, kcal, method }) => (
            <li key={s.id}>
              <span className="burn-icon" aria-hidden="true">
                {s.type === 'cardio' ? <HeartPulse size={16} /> : <Dumbbell size={16} />}
              </span>
              <span className="burn-name">
                {s.cardioActivity ?? s.name}
                <em>{describe(s)}</em>
              </span>
              <span className="burn-kcal">
                {method === 'entered' ? '' : '~'}
                {formatNumber(kcal)} kcal
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="burn-note">
        <Info size={14} aria-hidden="true" />
        {weight.source === 'default'
          ? `Kilon bilinmediği için ${DEFAULT_WEIGHT_KG} kg üzerinden hesaplandı — Vücut Takibi'ne kilonu ekle.`
          : `${formatNumber(weight.kg, 1)} kg üzerinden. Yürüyüş/koşu hız ve eğimle (ACSM), diğerleri MET değeriyle tahmin edilir.`}
      </p>
    </section>
  );
}
