import { useEffect, useState, type FormEvent } from 'react';
import { Activity, AlertTriangle, ArrowRight, Bot, CheckCircle2, Dumbbell, HeartPulse, Info, Scale, Sparkles, Utensils } from 'lucide-react';
import aiCoachService from '../services/aiCoachService';
import profileService from '../services/profileService';
import type { AiCoachAnalysisResponse, CoachInsight, InsightCategory, InsightSeverity } from '../types/aicoach';
import './Coach.css';

const GOALS = [
  { value: 0, label: 'Kas kazanmak (Bulk)', hint: 'Hafif kalori fazlası' },
  { value: 1, label: 'Yağ yakmak (Cut)', hint: 'Kontrollü kalori açığı' },
  { value: 2, label: 'Formu korumak', hint: 'Bakım kalorisi' },
] as const;

const CATEGORY: Record<InsightCategory, { label: string; icon: typeof Dumbbell }> = {
  training: { label: 'Antrenman', icon: Dumbbell },
  recovery: { label: 'Toparlanma', icon: HeartPulse },
  nutrition: { label: 'Beslenme', icon: Utensils },
  body: { label: 'Vücut', icon: Scale },
};

const SEVERITY: Record<InsightSeverity, { label: string; icon: typeof Info }> = {
  warning: { label: 'Dikkat', icon: AlertTriangle },
  info: { label: 'Öneri', icon: Info },
  good: { label: 'İyi gidiyor', icon: CheckCircle2 },
};

/** Profile goal text → coach goal. */
const goalFromProfile = (g?: string): 0 | 1 | 2 => (g === 'Kas Yapma' ? 0 : g === 'Kilo Verme' ? 1 : 2);

function InsightCard({ insight }: { insight: CoachInsight }) {
  const Cat = CATEGORY[insight.category]?.icon ?? Info;
  const Sev = SEVERITY[insight.severity].icon;
  return (
    <article className={`insight ${insight.severity}`}>
      <header>
        <span className="insight-cat">
          <Cat size={15} aria-hidden="true" /> {CATEGORY[insight.category]?.label}
        </span>
        <span className={`insight-sev ${insight.severity}`}>
          <Sev size={14} aria-hidden="true" /> {SEVERITY[insight.severity].label}
        </span>
      </header>
      <h3>{insight.title}</h3>
      {insight.metric && <p className="insight-metric">{insight.metric}</p>}
      <p className="insight-detail">{insight.detail}</p>
      <p className="insight-action">
        <ArrowRight size={16} aria-hidden="true" />
        <span>{insight.action}</span>
      </p>
    </article>
  );
}

export function Coach() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<0 | 1 | 2>(2);
  const [weeklyFreq, setWeeklyFreq] = useState('4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiCoachAnalysisResponse | null>(null);
  const [filter, setFilter] = useState<InsightCategory | 'all'>('all');

  // Prefill from the profile so the user can analyse with one click
  useEffect(() => {
    profileService
      .getProfile()
      .then((p) => {
        if (p.height) setHeight(String(p.height));
        if (p.weight) setWeight(String(p.weight));
        setGoal(goalFromProfile(p.fitnessGoal));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setResult(
        await aiCoachService.analyze({
          height: parseFloat(height) || 0,
          weight: parseFloat(weight) || 0,
          bodyFatPercentage: 0,
          goal,
          weeklyWorkoutFrequency: parseInt(weeklyFreq, 10) || 4,
        }),
      );
      setFilter('all');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Analiz alınamadı, tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const insights = result?.insights ?? [];
  const shown = filter === 'all' ? insights : insights.filter((i) => i.category === filter);
  const counts = insights.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.severity]: (acc[i.severity] ?? 0) + 1 }), {});
  const t = result?.targets;
  const s = result?.stats;

  return (
    <div className="coach-page">
      <div className="container">
        <section className="coach-header">
          <h1><Bot size="1em" aria-hidden="true" /> AI Koç</h1>
          <p>Son 8 haftadaki gerçek antrenmanlarını, öğünlerini ve tartılarını inceleyip sana özel, rakamlarla desteklenmiş öneriler verir.</p>
        </section>

        <form onSubmit={handleSubmit} className="coach-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="coach-goal">Hedefin</label>
              <select id="coach-goal" value={goal} onChange={(e) => setGoal(Number(e.target.value) as 0 | 1 | 2)}>
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="coach-freq">Haftada kaç gün antrenman planlıyorsun?</label>
              <input id="coach-freq" type="number" min="1" max="14" value={weeklyFreq} onChange={(e) => setWeeklyFreq(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="coach-height">Boy (cm)</label>
              <input id="coach-height" type="number" min="100" max="250" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="profilden" />
            </div>
            <div className="form-group">
              <label htmlFor="coach-weight">Kilo (kg)</label>
              <input id="coach-weight" type="number" min="30" max="300" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="son ölçümden" />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-analyze" disabled={loading}>
            <Sparkles size={18} aria-hidden="true" /> {loading ? 'Verilerin inceleniyor…' : result ? 'Yeniden Analiz Et' : 'Analiz Et'}
          </button>
        </form>

        {error && <div className="error-banner" role="alert">{error}</div>}

        {result && (
          <div className="coach-result">
            <section className="coach-summary card">
              <div className="summary-text">
                <span className="eyebrow">Özet</span>
                <p>{result.summary}</p>
                <div className="summary-counts">
                  {(['warning', 'info', 'good'] as const).map((k) =>
                    counts[k] ? (
                      <span key={k} className={`count ${k}`}>
                        {counts[k]} {SEVERITY[k].label.toLocaleLowerCase('tr-TR')}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
              {t && s && (
                <div className="targets">
                  <div className="target">
                    <span>Günlük kalori hedefi</span>
                    <strong>{t.calories} kcal</strong>
                    <em>{s.averageDailyCalories > 0 ? `şu an ort. ${s.averageDailyCalories}` : `bakım ~${t.tdee}`}</em>
                  </div>
                  <div className="target">
                    <span>Protein</span>
                    <strong>{t.proteinG} g</strong>
                    <em>{s.averageDailyProtein > 0 ? `şu an ort. ${s.averageDailyProtein} g` : 'günlük'}</em>
                  </div>
                  <div className="target">
                    <span>Karb / Yağ</span>
                    <strong>{t.carbsG} / {t.fatG} g</strong>
                    <em>günlük</em>
                  </div>
                  <div className="target">
                    <span>Antrenman</span>
                    <strong>{s.sessionsPerWeek.toLocaleString('tr-TR')}/hafta</strong>
                    <em>son 4 hafta</em>
                  </div>
                </div>
              )}
            </section>

            <div className="insight-filters" role="group" aria-label="Kategori">
              <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                Tümü ({insights.length})
              </button>
              {(Object.keys(CATEGORY) as InsightCategory[])
                .filter((c) => insights.some((i) => i.category === c))
                .map((c) => (
                  <button key={c} type="button" className={filter === c ? 'active' : ''} onClick={() => setFilter(c)}>
                    {CATEGORY[c].label} ({insights.filter((i) => i.category === c).length})
                  </button>
                ))}
            </div>

            <div className="insights">
              {shown.map((i, idx) => (
                <InsightCard key={`${i.title}-${idx}`} insight={i} />
              ))}
            </div>

            <p className="coach-footnote">
              <Activity size={14} aria-hidden="true" />
              Hedefler Mifflin-St Jeor formülü ve haftalık antrenman sıklığına göre hesaplanır; güç gelişimi set kayıtlarından (tahmini 1RM)
              çıkarılır. Bunlar genel önerilerdir, tıbbi tavsiye değildir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Coach;
