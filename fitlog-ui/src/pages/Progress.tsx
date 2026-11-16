import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, Dumbbell, Scale, TrendingUp, Trophy } from 'lucide-react';
import {
  bodyApi,
  sessionsApi,
  type BodyMeasurement,
  type ExerciseHistoryPoint,
  type PersonalRecord,
  type WeeklyVolumePoint,
  type WorkoutSession,
} from '../services/trackingService';
import { useSettings } from '../store/SettingsContext';
import { TrendChart, type TrendPoint } from '../components/TrendChart';
import { formatNumber, formatWeight, kgToUnit } from '../utils/units';
import './Progress.css';

type Metric = 'estimated1Rm' | 'bestWeightKg' | 'volumeKg';
const METRICS: Record<Metric, string> = {
  estimated1Rm: 'Tahmini 1RM',
  bestWeightKg: 'En ağır set',
  volumeKg: 'Hacim',
};

const shortDate = (d: string | Date) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

export function Progress() {
  const { settings } = useSettings();
  const unit = settings.weightUnit;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exercises, setExercises] = useState<string[]>([]);
  const [exercise, setExercise] = useState('');
  const [metric, setMetric] = useState<Metric>('estimated1Rm');
  const [history, setHistory] = useState<ExerciseHistoryPoint[]>([]);
  const [weekly, setWeekly] = useState<WeeklyVolumePoint[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    Promise.all([
      sessionsApi.exercises(),
      sessionsApi.weeklyVolume(12),
      sessionsApi.personalRecords(),
      bodyApi.measurements(),
      sessionsApi.list({ from: new Date(Date.now() - 31 * 86400000).toISOString() }),
    ])
      .then(([ex, wk, pr, ms, recent]) => {
        setExercises(ex);
        // Default to the exercise with the strongest record (usually a main lift)
        setExercise(pr[0]?.exerciseName ?? ex[0] ?? '');
        setWeekly(wk);
        setRecords(pr);
        setMeasurements(ms);
        setSessions(recent);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!exercise) return;
    sessionsApi.exerciseHistory(exercise).then(setHistory).catch(() => setHistory([]));
  }, [exercise]);

  const weightFmt = (kg: number) => formatWeight(kg, unit);
  const exercisePoints: TrendPoint[] = history.map((h) => ({
    label: shortDate(h.date),
    value: h[metric],
    detail: `En ağır: ${formatNumber(kgToUnit(h.bestWeightKg, unit), 1)} ${unit} × ${h.repsAtBest}`,
  }));
  const weeklyPoints: TrendPoint[] = weekly.map((w) => ({
    label: shortDate(w.weekStart),
    value: w.volumeKg,
    detail: `${w.sessions} antrenman · ${w.sets} set${w.cardioMinutes ? ` · ${w.cardioMinutes} dk kardiyo` : ''}`,
  }));
  const weightPoints: TrendPoint[] = [...measurements]
    .filter((m) => m.weightKg != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ label: shortDate(`${m.date}T00:00`), value: m.weightKg! }));

  const stats = useMemo(() => {
    // Early in the week there's nothing logged yet; show last week instead of a misleading -100%
    const current = weekly[weekly.length - 1];
    const useCurrent = !!current && current.sessions > 0;
    const thisWeek = useCurrent ? current : weekly[weekly.length - 2];
    const lastWeek = useCurrent ? weekly[weekly.length - 2] : weekly[weekly.length - 3];
    const change = thisWeek && lastWeek && lastWeek.volumeKg > 0 ? ((thisWeek.volumeKg - lastWeek.volumeKg) / lastWeek.volumeKg) * 100 : null;
    const latestWeight = weightPoints[weightPoints.length - 1]?.value;
    const firstWeight = weightPoints[0]?.value;
    return {
      sessions30: sessions.length,
      weekLabel: useCurrent ? 'Bu haftanın hacmi' : 'Geçen haftanın hacmi',
      weekVolume: thisWeek?.volumeKg ?? 0,
      change,
      latestWeight,
      weightDelta: latestWeight != null && firstWeight != null && weightPoints.length > 1 ? latestWeight - firstWeight : null,
    };
  }, [weekly, sessions, weightPoints]);

  if (loading) {
    return (
      <div className="progress-page">
        <div className="container progress-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const noData = exercises.length === 0 && weekly.every((w) => w.sessions === 0) && measurements.length === 0;

  return (
    <div className="progress-page">
      <div className="container">
        <div className="progress-header">
          <h1><TrendingUp size="1em" aria-hidden="true" /> İlerleme</h1>
          <p>Antrenman ve vücut verilerinden otomatik oluşturulur.</p>
        </div>

        {error && <div className="error-banner" role="alert">İlerleme verileri yüklenemedi.</div>}

        {noData ? (
          <div className="card progress-empty">
            <BarChart3 size={40} aria-hidden="true" />
            <h2>Henüz veri yok</h2>
            <p>Antrenman modunda setlerini kaydettikçe ve ölçüm ekledikçe grafiklerin burada oluşur.</p>
            <Link to="/workout-mode" className="btn-primary">Antrenmana Başla</Link>
          </div>
        ) : (
          <>
            <div className="stat-tiles">
              <div className="stat-tile">
                <span className="tile-label">Son 30 gün</span>
                <strong>{stats.sessions30}</strong>
                <span className="tile-sub">antrenman</span>
              </div>
              <div className="stat-tile">
                <span className="tile-label">{stats.weekLabel}</span>
                <strong>{formatNumber(kgToUnit(stats.weekVolume, unit))}</strong>
                <span className="tile-sub">
                  {unit}
                  {stats.change != null && (
                    <em className={stats.change >= 0 ? 'up' : 'down'}>
                      {' '}{stats.change >= 0 ? '▲' : '▼'} %{formatNumber(Math.abs(stats.change))} önceki haftaya göre
                    </em>
                  )}
                </span>
              </div>
              <div className="stat-tile">
                <span className="tile-label">Kişisel rekor</span>
                <strong>{records.length}</strong>
                <span className="tile-sub">egzersizde kayıt</span>
              </div>
              <div className="stat-tile">
                <span className="tile-label">Güncel kilo</span>
                <strong>{stats.latestWeight != null ? formatNumber(kgToUnit(stats.latestWeight, unit), 1) : '—'}</strong>
                <span className="tile-sub">
                  {unit}
                  {stats.weightDelta != null && ` · ${stats.weightDelta > 0 ? '+' : ''}${formatNumber(kgToUnit(stats.weightDelta, unit), 1)} toplam`}
                </span>
              </div>
            </div>

            <section className="card chart-card">
              <div className="chart-head">
                <div>
                  <h2><Dumbbell size="1em" aria-hidden="true" /> Egzersiz gelişimi</h2>
                  <p>{METRICS[metric]} · antrenman başına</p>
                </div>
              </div>
              {exercises.length > 0 ? (
                <>
                  <div className="chart-filters">
                    <select value={exercise} onChange={(e) => setExercise(e.target.value)} aria-label="Egzersiz">
                      {exercises.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <div className="segmented" role="group" aria-label="Ölçüt">
                      {(Object.keys(METRICS) as Metric[]).map((m) => (
                        <button key={m} type="button" className={metric === m ? 'active' : ''} aria-pressed={metric === m} onClick={() => setMetric(m)}>
                          {METRICS[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {exercisePoints.length > 1 ? (
                    <TrendChart kind="line" points={exercisePoints} seriesLabel={`${exercise} – ${METRICS[metric]}`} formatValue={weightFmt} />
                  ) : (
                    <p className="chart-empty">Grafik için bu egzersizi en az 2 antrenmanda kaydetmelisin.</p>
                  )}
                </>
              ) : (
                <p className="chart-empty">Antrenman modunda ağırlıklı set kaydettiğinde burada görünür.</p>
              )}
            </section>

            <div className="chart-row">
              <section className="card chart-card">
                <div className="chart-head">
                  <div>
                    <h2><Activity size="1em" aria-hidden="true" /> Haftalık hacim</h2>
                    <p>Son 12 hafta · set × tekrar × ağırlık</p>
                  </div>
                </div>
                {weeklyPoints.some((p) => p.value > 0) ? (
                  <TrendChart kind="bar" points={weeklyPoints} seriesLabel="Haftalık hacim" formatValue={weightFmt} height={220} />
                ) : (
                  <p className="chart-empty">Bu dönemde ağırlıklı set kaydı yok.</p>
                )}
              </section>

              <section className="card chart-card">
                <div className="chart-head">
                  <div>
                    <h2><Scale size="1em" aria-hidden="true" /> Vücut ağırlığı</h2>
                    <p>Vücut Takibi'ndeki ölçümlerden</p>
                  </div>
                </div>
                {weightPoints.length > 1 ? (
                  <TrendChart kind="line" points={weightPoints} seriesLabel="Kilo" formatValue={(v) => formatWeight(v, unit)} height={220} />
                ) : (
                  <p className="chart-empty">
                    Grafik için en az 2 kilo ölçümü gerekiyor. <Link to="/body-tracking">Ölçüm ekle</Link>
                  </p>
                )}
              </section>
            </div>

            <section className="card">
              <h2 className="pr-title"><Trophy size="1em" aria-hidden="true" /> Kişisel rekorlar</h2>
              {records.length === 0 ? (
                <p className="chart-empty">Henüz rekor yok.</p>
              ) : (
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th scope="col">Egzersiz</th>
                        <th scope="col">En ağır set</th>
                        <th scope="col">Tahmini 1RM</th>
                        <th scope="col">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.exerciseName}>
                          <th scope="row">
                            <button type="button" className="link-btn" onClick={() => { setExercise(r.exerciseName); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                              {r.exerciseName}
                            </button>
                          </th>
                          <td>{formatNumber(kgToUnit(r.bestWeightKg, unit), 1)} {unit} × {r.repsAtBest}</td>
                          <td>{formatWeight(r.bestEstimated1Rm, unit)}</td>
                          <td>{new Date(r.achievedAt).toLocaleDateString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Progress;
