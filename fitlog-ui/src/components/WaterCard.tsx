import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Minus, Plus } from 'lucide-react';
import { bodyApi } from '../services/trackingService';
import { useSettings } from '../store/SettingsContext';
import { toLocalDateInput } from '../utils/dateTime';
import './WaterCard.css';

const ML_PER_GLASS = 250;

/** Today's water on the dashboard, with quick +/- so it can be logged without leaving the page. */
export function WaterCard() {
  const { settings } = useSettings();
  const goal = Math.max(1, settings.waterGoalGlasses || 8);
  const today = toLocalDateInput();
  const [glasses, setGlasses] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    bodyApi
      .water(today, today)
      .then((logs) => setGlasses(logs.find((l) => l.date === today)?.glasses ?? 0))
      .catch(() => setGlasses(0));
  }, [today]);

  const change = async (delta: number) => {
    if (glasses == null) return;
    const previous = glasses;
    const next = Math.max(0, previous + delta);
    if (next === previous) return;
    setGlasses(next);
    setError('');
    try {
      await bodyApi.setWater(today, next);
    } catch {
      setGlasses(previous);
      setError('Kaydedilemedi, tekrar dene.');
    }
  };

  const count = glasses ?? 0;
  const percent = Math.min(100, Math.round((count / goal) * 100));
  const left = Math.max(0, goal - count);

  return (
    <section className="water-card card" aria-label="Bugün içilen su">
      <div className="water-card-head">
        <div>
          <span className="water-card-label">Bugün içilen su</span>
          <strong className="water-card-total">
            <Droplet size={26} aria-hidden="true" />
            {glasses == null ? '–' : count}
            <small>/ {goal} bardak</small>
          </strong>
          <span className="water-card-sub">
            {(count * ML_PER_GLASS / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} L
            {' · '}
            {left > 0 ? `${left} bardak kaldı` : 'Hedefe ulaştın!'}
          </span>
        </div>
        <div className="water-card-actions">
          <button type="button" className="water-btn" onClick={() => change(-1)} disabled={!glasses} aria-label="Bir bardak çıkar">
            <Minus size={18} aria-hidden="true" />
          </button>
          <button type="button" className="water-btn add" onClick={() => change(1)} disabled={glasses == null} aria-label="Bir bardak ekle">
            <Plus size={18} aria-hidden="true" /> Bardak
          </button>
        </div>
      </div>

      <div
        className="water-card-bar"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label="Su hedefi"
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      <div className="water-card-foot">
        {error ? <span className="water-card-error">{error}</span> : <span>%{percent} · 1 bardak = {ML_PER_GLASS} ml</span>}
        <Link to="/body-tracking">Su geçmişi</Link>
      </div>
    </section>
  );
}

export default WaterCard;
