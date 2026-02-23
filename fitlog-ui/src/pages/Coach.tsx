import { useState, FormEvent } from 'react';
import aiCoachService from '../services/aiCoachService';
import type { AiCoachAnalysisResponse } from '../types/aicoach';
import './Coach.css';

const GOAL_LABELS: Record<number, string> = {
  0: 'Bulk (Kilo al)',
  1: 'Cut (Yağ yak)',
  2: 'Maintain (Koru)',
};

export function Coach() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [goal, setGoal] = useState<0 | 1 | 2>(0);
  const [weeklyFreq, setWeeklyFreq] = useState('4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiCoachAnalysisResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await aiCoachService.analyze({
        height: parseFloat(height) || 0,
        weight: parseFloat(weight) || 0,
        bodyFatPercentage: parseFloat(bodyFat) || 0,
        goal,
        weeklyWorkoutFrequency: parseInt(weeklyFreq, 10) || 4,
      });
      setResult(response);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Analiz alınırken bir hata oluştu.';
      setError(msg || 'Analiz alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-page">
      <div className="container">
        <section className="coach-header animate-slideUp">
          <h1>🤖 AI Koç</h1>
          <p>Son 30 günlük antrenman ve beslenme verine göre kişiselleştirilmiş öneri al.</p>
        </section>

        <form onSubmit={handleSubmit} className="coach-form animate-slideUp">
          <div className="form-grid">
            <div className="form-group">
              <label>Boy (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="180"
                required
              />
            </div>
            <div className="form-group">
              <label>Kilo (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                required
              />
            </div>
            <div className="form-group">
              <label>Vücut yağ oranı (%)</label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="18"
              />
            </div>
            <div className="form-group">
              <label>Hedef</label>
              <select value={goal} onChange={(e) => setGoal(Number(e.target.value) as 0 | 1 | 2)}>
                {[0, 1, 2].map((g) => (
                  <option key={g} value={g}>{GOAL_LABELS[g]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Haftalık antrenman sayısı</label>
              <input
                type="number"
                min="1"
                max="14"
                value={weeklyFreq}
                onChange={(e) => setWeeklyFreq(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-analyze" disabled={loading}>
            {loading ? 'Analiz yapılıyor...' : 'Analiz Al'}
          </button>
        </form>

        {error && (
          <div className="coach-error animate-slideUp">
            {error}
          </div>
        )}

        {result && (
          <div className="coach-result animate-slideUp">
            <h2>📋 Sonuçlar</h2>

            <div className="result-metrics">
              <h3>Hesaplanan metrikler</h3>
              <p>Ortalama haftalık kalori: <strong>{result.calculatedMetrics.averageWeeklyCalories.toFixed(0)}</strong></p>
              <p>Ortalama haftalık protein: <strong>{result.calculatedMetrics.averageWeeklyProtein.toFixed(0)} g</strong></p>
              <p>Makro (P/C/Y): %{result.calculatedMetrics.proteinPercent.toFixed(0)} / %{result.calculatedMetrics.carbsPercent.toFixed(0)} / %{result.calculatedMetrics.fatPercent.toFixed(0)}</p>
              <p>Progressive overload: {result.calculatedMetrics.progressiveOverloadDetected ? '✅ Evet' : '❌ Hayır'}</p>
              {result.calculatedMetrics.plateauDetected && (
                <p className="plateau-warn">Plateau: {result.calculatedMetrics.plateauExercises.join(', ')}</p>
              )}
            </div>

            <div className="result-advice">
              <h3>Antrenman önerisi</h3>
              <p>{result.trainingAdvice || '—'}</p>
            </div>
            <div className="result-advice">
              <h3>Beslenme önerisi</h3>
              <p>{result.nutritionAdvice || '—'}</p>
            </div>
            <div className="result-advice">
              <h3>Bulk/Cut onayı</h3>
              <p>{result.bulkCutRecommendation || '—'}</p>
            </div>
            <div className="result-advice">
              <h3>Makro önerisi</h3>
              <p>{result.macroSuggestion || '—'}</p>
            </div>
            {result.plateauWarning && (
              <div className="result-warning">
                <h3>⚠️ Plateau uyarısı</h3>
                <p>{result.plateauWarning}</p>
              </div>
            )}
            <div className="result-raw">
              <details>
                <summary>Tam AI yanıtı</summary>
                <pre>{result.rawAiRecommendation}</pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Coach;
