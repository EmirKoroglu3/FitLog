import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Share2 } from 'lucide-react';
import { sessionsApi, type WorkoutSession } from '../services/trackingService';
import { useSettings } from '../store/SettingsContext';
import { formatNumber, kgToUnit } from '../utils/units';
import { formatPace } from '../components/CardioModal';
import './SessionSummary.css';

interface ExerciseLine {
  name: string;
  sets: number;
  best: string;
}

const durationText = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h} sa ${m} dk` : `${m} dk`;
};

export function SessionSummary() {
  const { id } = useParams();
  const { settings } = useSettings();
  const unit = settings.weightUnit;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) sessionsApi.get(id).then(setSession).catch(() => setError(true));
  }, [id]);

  const lines: ExerciseLine[] = useMemo(() => {
    if (!session) return [];
    const byName = new Map<string, { sets: number; bestKg: number; reps: number }>();
    session.sets.filter((s) => !s.isWarmup).forEach((s) => {
      const cur = byName.get(s.exerciseName) ?? { sets: 0, bestKg: 0, reps: 0 };
      cur.sets++;
      if (s.weightKg > cur.bestKg || (s.weightKg === cur.bestKg && s.reps > cur.reps)) {
        cur.bestKg = s.weightKg;
        cur.reps = s.reps;
      }
      byName.set(s.exerciseName, cur);
    });
    return [...byName].map(([name, v]) => ({
      name,
      sets: v.sets,
      best: v.bestKg > 0 ? `${formatNumber(kgToUnit(v.bestKg, unit), 1)} ${unit} × ${v.reps}` : `${v.reps} tekrar`,
    }));
  }, [session, unit]);

  if (error) {
    return (
      <div className="summary-page">
        <div className="container">
          <p className="error-banner">Antrenman bulunamadı.</p>
          <Link to="/calendar">Takvime dön</Link>
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="summary-page">
        <div className="container summary-loading"><div className="spinner" /></div>
      </div>
    );
  }

  const date = new Date(session.startedAt).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const isCardio = session.type === 'cardio';
  const stats: [string, string][] = isCardio
    ? [
        ['Süre', durationText(session.durationSeconds)],
        ...(session.distanceKm ? ([['Mesafe', `${formatNumber(session.distanceKm, 2)} km`]] as [string, string][]) : []),
        ...(session.distanceKm ? ([['Tempo', formatPace(session.durationSeconds / 60, session.distanceKm) ?? '-']] as [string, string][]) : []),
        ...(session.caloriesBurned ? ([['Kalori', `${session.caloriesBurned} kcal`]] as [string, string][]) : []),
      ]
    : [
        ['Süre', durationText(session.durationSeconds)],
        ['Set', String(session.setCount)],
        ['Hacim', `${formatNumber(kgToUnit(session.totalVolumeKg, unit))} ${unit}`],
      ];

  const shareText = [
    `💪 FitLog — ${session.name} (${date})`,
    stats.map(([k, v]) => `${k}: ${v}`).join(' · '),
    ...lines.map((l) => `• ${l.name}: ${l.sets} set, en iyi ${l.best}`),
  ].join('\n');

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FitLog antrenmanım', text: shareText });
        return;
      } catch {
        /* user cancelled */
        return;
      }
    }
    copy();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** Draws a 1080×1350 story-style image of the summary and downloads it. */
  const downloadImage = async () => {
    await document.fonts.ready;
    const W = 1080;
    const H = 1350;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    g.fillStyle = '#18181b';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#ea580c';
    g.fillRect(0, 0, W, 16);

    const display = (size: number, weight = 800) => `italic ${weight} ${size}px "Barlow Condensed", sans-serif`;
    const body = (size: number, weight = 500) => `${weight} ${size}px "Barlow", sans-serif`;

    g.fillStyle = '#ea580c';
    g.font = display(56);
    g.fillText('FITLOG', 80, 130);

    g.fillStyle = '#a1a1aa';
    g.font = body(34);
    g.fillText(date, 80, 210);

    g.fillStyle = '#fafafa';
    g.font = display(104);
    g.fillText(session.name.toUpperCase().slice(0, 18), 80, 320);

    // stats row
    const colW = (W - 160) / stats.length;
    stats.forEach(([k, v], i) => {
      const x = 80 + i * colW;
      g.fillStyle = '#fafafa';
      g.font = display(64, 700);
      g.fillText(v, x, 470);
      g.fillStyle = '#a1a1aa';
      g.font = body(30);
      g.fillText(k, x, 515);
    });

    g.fillStyle = '#3f3f46';
    g.fillRect(80, 575, W - 160, 2);

    lines.slice(0, 8).forEach((l, i) => {
      const y = 660 + i * 80;
      g.fillStyle = '#fafafa';
      g.font = body(38, 600);
      g.fillText(l.name.slice(0, 26), 80, y);
      g.fillStyle = '#a1a1aa';
      g.font = body(34);
      const right = `${l.sets} × · ${l.best}`;
      g.fillText(right, W - 80 - g.measureText(right).width, y);
    });

    g.fillStyle = '#71717a';
    g.font = body(28);
    g.fillText('emirkoroglu.online', 80, H - 70);

    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `fitlog-${session.startedAt.slice(0, 10)}.png`;
    a.click();
  };

  return (
    <div className="summary-page">
      <div className="container">
        <Link to="/calendar" className="back-link">
          <ArrowLeft size="1em" aria-hidden="true" /> Takvim
        </Link>

        <article className="summary-card">
          <span className="eyebrow">{date}</span>
          <h1>{session.name}</h1>
          <div className="summary-stats">
            {stats.map(([k, v]) => (
              <div key={k}>
                <strong>{v}</strong>
                <span>{k}</span>
              </div>
            ))}
          </div>
          {lines.length > 0 && (
            <ul className="summary-lines">
              {lines.map((l) => (
                <li key={l.name}>
                  <span>{l.name}</span>
                  <span>
                    {l.sets} set · <strong>{l.best}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {session.notes && <p className="summary-notes">{session.notes}</p>}
        </article>

        <div className="summary-actions">
          <button className="btn-primary" onClick={share}>
            <Share2 size="1em" aria-hidden="true" /> Paylaş
          </button>
          <button className="btn-secondary" onClick={copy}>
            <Copy size="1em" aria-hidden="true" /> {copied ? 'Kopyalandı' : 'Metni kopyala'}
          </button>
          <button className="btn-secondary" onClick={downloadImage}>
            <Download size="1em" aria-hidden="true" /> Görsel indir
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionSummary;
