import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import './BodyTracking.css';
import { ProgressPhotos } from '../components/ProgressPhotos';
import { toLocalDateInput } from '../utils/dateTime';
import { useSettings } from '../store/SettingsContext';
import { cmToUnit, formatLength, formatNumber, formatWeight, kgToUnit, unitToCm, unitToKg, type LengthUnit, type WeightUnit } from '../utils/units';
import { bodyApi, type BodyMeasurement as ApiMeasurement } from '../services/trackingService';
import { Camera, BarChart3, BicepsFlexed, CalendarDays, ClipboardList, Droplet, PartyPopper, Ruler, Scale, Target, Trash2 } from 'lucide-react';
import { useConfirm } from '../components/ConfirmProvider';
import profileService from '../services/profileService';
import type { ProfileDto } from '../types/profile';
import { ageFromBirthDate, estimateBodyFat } from '../utils/bodyFat';

interface WaterLog {
  date: string;
  glasses: number;
}

interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  neck?: number;
}

/** Form values are typed in the user's units; the API stores kg / cm. */
const toApi = (m: Partial<BodyMeasurement>, fallbackDate: string, wu: WeightUnit, lu: LengthUnit) => {
  const len = (v?: number) => (v == null || Number.isNaN(v) ? null : unitToCm(v, lu));
  return {
    date: m.date || fallbackDate,
    weightKg: m.weight == null || Number.isNaN(m.weight) ? null : unitToKg(m.weight, wu),
    bodyFatPercent: m.bodyFat ?? null,
    chest: len(m.chest),
    waist: len(m.waist),
    hips: len(m.hips),
    biceps: len(m.biceps),
    thigh: len(m.thighs),
    calf: len(m.calves),
    neck: len(m.neck),
  };
};

const fromApi = (m: ApiMeasurement): BodyMeasurement => ({
  id: m.id,
  date: m.date,
  weight: m.weightKg ?? undefined,
  bodyFat: m.bodyFatPercent ?? undefined,
  chest: m.chest ?? undefined,
  waist: m.waist ?? undefined,
  hips: m.hips ?? undefined,
  biceps: m.biceps ?? undefined,
  thighs: m.thigh ?? undefined,
  calves: m.calf ?? undefined,
  neck: m.neck ?? undefined,
});

export function BodyTracking() {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const { settings, update: updateSettings } = useSettings();
  const today = toLocalDateInput();
  const waterGoal = settings.waterGoalGlasses;
  const wUnit = settings.weightUnit;
  const lUnit = settings.measurementUnit;
  const len = (cm?: number) => (cm == null ? '-' : formatLength(cm, lUnit));
  const [todayWater, setTodayWater] = useState(0);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    date: today
  });
  const [activeTab, setActiveTab] = useState<'water' | 'body' | 'photos'>('water');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  useEffect(() => {
    if (!user) return;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    Promise.all([bodyApi.water(toLocalDateInput(weekAgo), today), bodyApi.measurements()])
      .then(([water, ms]) => {
        setWaterLogs(water);
        setTodayWater(water.find(l => l.date === today)?.glasses ?? 0);
        setMeasurements(ms.map(fromApi));
      })
      .catch(() => setError('Veriler yüklenemedi.'));
    profileService.getProfile().then(setProfile).catch(() => {});
  }, [user]);

  // Body fat is estimated from the profile + this measurement instead of being typed in
  const toCm = (v?: number) => (v == null || Number.isNaN(v) ? undefined : unitToCm(v, lUnit));
  const formWeightKg = newMeasurement.weight == null || Number.isNaN(newMeasurement.weight) ? undefined : unitToKg(newMeasurement.weight, wUnit);
  const bodyFatEstimate = estimateBodyFat({
    gender: profile?.gender,
    heightCm: profile?.height,
    weightKg: formWeightKg ?? measurements.find((m) => m.weight != null)?.weight ?? profile?.weight,
    ageYears: profile?.age ?? ageFromBirthDate(profile?.birthDate),
    waistCm: toCm(newMeasurement.waist),
    neckCm: toCm(newMeasurement.neck),
    hipCm: toCm(newMeasurement.hips),
  });
  const isFemaleProfile = (profile?.gender ?? '').toLocaleLowerCase('tr-TR').startsWith('kad');

  const addWater = async (amount: number = 1) => {
    const newAmount = Math.max(0, todayWater + amount);
    const previous = todayWater;
    setTodayWater(newAmount);
    setWaterLogs(logs => [...logs.filter(l => l.date !== today), { date: today, glasses: newAmount }]);
    try {
      await bodyApi.setWater(today, newAmount);
    } catch {
      setTodayWater(previous);
      setError('Su kaydı kaydedilemedi.');
    }
  };

  const updateWaterGoal = (goal: number) => {
    updateSettings({ waterGoalGlasses: goal }).catch(() => setError('Hedef kaydedilemedi.'));
  };

  const saveMeasurement = async () => {
    try {
      const withEstimate = { ...newMeasurement, bodyFat: bodyFatEstimate?.percent };
      const saved = fromApi(await bodyApi.addMeasurement(toApi(withEstimate, today, wUnit, lUnit)));
      setMeasurements(ms => [...ms, saved].sort((a, b) => b.date.localeCompare(a.date)));
      setShowMeasurementModal(false);
      setNewMeasurement({ date: today });
    } catch {
      setError('Ölçüm kaydedilemedi. Değerleri kontrol et.');
    }
  };

  const deleteMeasurement = async (id: string) => {
    if (!(await confirm({ title: 'Ölçüm silinsin mi?', confirmText: 'Sil', danger: true }))) return;
    try {
      await bodyApi.deleteMeasurement(id);
      setMeasurements(ms => ms.filter(m => m.id !== id));
    } catch {
      setError('Ölçüm silinemedi.');
    }
  };

  const getProgressPercent = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getWeeklyWaterAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = waterLogs.filter(l => l.date >= toLocalDateInput(weekAgo));
    if (weekLogs.length === 0) return 0;
    return (weekLogs.reduce((sum, l) => sum + l.glasses, 0) / weekLogs.length).toFixed(1);
  };

  const getLatestMeasurement = (field: keyof BodyMeasurement) => {
    for (const m of measurements) {
      if (m[field] !== undefined) return m[field];
    }
    return undefined;
  };

  const getWeightChange = () => {
    const weights = measurements
      .filter(m => m.weight !== undefined)
      .map(m => ({ date: m.date, weight: m.weight! }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (weights.length < 2) return null;
    return weights[weights.length - 1].weight - weights[0].weight;
  };

  const waterPercent = getProgressPercent(todayWater, waterGoal);
  const weightChange = getWeightChange();

  return (
    <div className="body-tracking-page">
      <div className="container">
        <h1><Ruler size="1em" aria-hidden="true" /> Vücut Takibi</h1>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'water' ? 'active' : ''}`}
            onClick={() => setActiveTab('water')}
          >
            <Droplet size="1em" aria-hidden="true" /> Su Takibi
          </button>
          <button 
            className={`tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            <Ruler size="1em" aria-hidden="true" /> Vücut Ölçüleri
          </button>
          <button
            className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <Camera size="1em" aria-hidden="true" /> Fotoğraflar
          </button>
        </div>

        {activeTab === 'photos' ? (
          <ProgressPhotos />
        ) : activeTab === 'water' ? (
          /* Su Takibi Tab */
          <div className="water-tracking">
            <div className="water-main card">
              <div className="water-circle-container">
                <div className="water-circle">
                  <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" className="water-bg" />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="90" 
                      className="water-progress"
                      style={{
                        strokeDasharray: 565.48,
                        strokeDashoffset: 565.48 * (1 - waterPercent / 100)
                      }}
                    />
                  </svg>
                  <div className="water-info">
                    <span className="water-icon"><Droplet size="1em" aria-hidden="true" /></span>
                    <span className="water-count">{todayWater}</span>
                    <span className="water-goal">/ {waterGoal} bardak</span>
                  </div>
                </div>
              </div>

              <div className="water-actions">
                <button className="water-btn remove" onClick={() => addWater(-1)}>
                  −
                </button>
                <button className="water-btn add" onClick={() => addWater(1)}>
                  +
                </button>
              </div>

              <div className="quick-add">
                {[1, 2, 3, 4].map(num => (
                  <button 
                    key={num}
                    className="quick-btn"
                    onClick={() => addWater(num)}
                  >
                    +{num} <Droplet size="1em" aria-hidden="true" />
                  </button>
                ))}
              </div>

              {todayWater >= waterGoal && (
                <div className="goal-reached">
                  <PartyPopper size="1em" aria-hidden="true" /> Günlük hedefinize ulaştınız!
                </div>
              )}
            </div>

            <div className="water-sidebar">
              {/* Hedef Ayarı */}
              <div className="water-goal-card card">
                <h3><Target size="1em" aria-hidden="true" /> Günlük Hedef</h3>
                <div className="goal-selector">
                  {[6, 8, 10, 12].map(goal => (
                    <button
                      key={goal}
                      className={`goal-btn ${waterGoal === goal ? 'active' : ''}`}
                      onClick={() => updateWaterGoal(goal)}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <p className="goal-info">bardak / gün</p>
              </div>

              {/* İstatistikler */}
              <div className="water-stats card">
                <h3><BarChart3 size="1em" aria-hidden="true" /> İstatistikler</h3>
                <div className="stat-row">
                  <span>Bugün</span>
                  <span className="stat-value">{todayWater} bardak</span>
                </div>
                <div className="stat-row">
                  <span>7 Günlük Ort.</span>
                  <span className="stat-value">{getWeeklyWaterAverage()} bardak</span>
                </div>
                <div className="stat-row">
                  <span>Hedefe Ulaşılan Gün</span>
                  <span className="stat-value">
                    {waterLogs.filter(l => l.glasses >= waterGoal).length}
                  </span>
                </div>
              </div>

              {/* Son 7 Gün */}
              <div className="water-history card">
                <h3><CalendarDays size="1em" aria-hidden="true" /> Son 7 Gün</h3>
                <div className="history-bars">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = toLocalDateInput(date);
                    const log = waterLogs.find(l => l.date === dateStr);
                    const percent = log ? getProgressPercent(log.glasses, waterGoal) : 0;
                    
                    return (
                      <div key={i} className="history-bar-container">
                        <div 
                          className={`history-bar ${percent >= 100 ? 'complete' : ''}`}
                          style={{ height: `${Math.max(percent, 5)}%` }}
                        />
                        <span className="history-day">
                          {['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vücut Ölçüleri Tab */
          <div className="body-measurements">
            <div className="measurements-header">
              <button 
                className="btn-primary"
                onClick={() => setShowMeasurementModal(true)}
              >
                + Yeni Ölçüm
              </button>
            </div>

            {/* Özet Kartları */}
            <div className="measurement-summary">
              <div className="summary-card card">
                <span className="summary-icon"><Scale size="1em" aria-hidden="true" /></span>
                <span className="summary-value">
                  {formatWeight(getLatestMeasurement('weight') as number | undefined, wUnit)}
                </span>
                <span className="summary-label">Son Kilo</span>
                {weightChange !== null && (
                  <span className={`weight-change ${weightChange > 0 ? 'gain' : 'loss'}`}>
                    {weightChange > 0 ? '+' : ''}{formatWeight(weightChange, wUnit)}
                  </span>
                )}
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon"><BarChart3 size="1em" aria-hidden="true" /></span>
                <span className="summary-value">
                  {getLatestMeasurement('bodyFat') || '-'}%
                </span>
                <span className="summary-label">Vücut Yağı (tahmini)</span>
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon"><Ruler size="1em" aria-hidden="true" /></span>
                <span className="summary-value">
                  {len(getLatestMeasurement('waist') as number | undefined)}
                </span>
                <span className="summary-label">Bel</span>
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon"><BicepsFlexed size="1em" aria-hidden="true" /></span>
                <span className="summary-value">
                  {len(getLatestMeasurement('biceps') as number | undefined)}
                </span>
                <span className="summary-label">Biceps</span>
              </div>
            </div>

            {/* Ölçüm Geçmişi */}
            <div className="measurements-history card">
              <h3><ClipboardList size="1em" aria-hidden="true" /> Ölçüm Geçmişi</h3>
              
              {measurements.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon"><Ruler size="1em" aria-hidden="true" /></span>
                  <p>Henüz ölçüm eklenmedi</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowMeasurementModal(true)}
                  >
                    İlk Ölçümü Ekle
                  </button>
                </div>
              ) : (
                <div className="measurements-table-container">
                  <table className="measurements-table">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Kilo ({wUnit})</th>
                        <th>Yağ (%)</th>
                        <th>Göğüs</th>
                        <th>Bel</th>
                        <th>Kalça</th>
                        <th>Biceps</th>
                        <th>Bacak</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map(m => (
                        <tr key={m.id}>
                          <td>{new Date(`${m.date}T00:00`).toLocaleDateString('tr-TR')}</td>
                          <td>{m.weight != null ? formatNumber(kgToUnit(m.weight, wUnit), 1) : '-'}</td>
                          <td>{m.bodyFat || '-'}</td>
                          <td>{m.chest != null ? formatNumber(cmToUnit(m.chest, lUnit), 1) : '-'}</td>
                          <td>{m.waist != null ? formatNumber(cmToUnit(m.waist, lUnit), 1) : '-'}</td>
                          <td>{m.hips != null ? formatNumber(cmToUnit(m.hips, lUnit), 1) : '-'}</td>
                          <td>{m.biceps != null ? formatNumber(cmToUnit(m.biceps, lUnit), 1) : '-'}</td>
                          <td>{m.thighs != null ? formatNumber(cmToUnit(m.thighs, lUnit), 1) : '-'}</td>
                          <td>
                            <button 
                              className="btn-icon delete"
                              onClick={() => deleteMeasurement(m.id)}
                            >
                              <Trash2 size="1em" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ölçüm Modal */}
      {showMeasurementModal && (
        <div className="modal-overlay" onClick={() => setShowMeasurementModal(false)}>
          <div className="modal-content measurement-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Ruler size="1em" aria-hidden="true" /> Yeni Ölçüm</h2>
              <button className="btn-close" onClick={() => setShowMeasurementModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tarih</label>
                <input 
                  type="date" 
                  value={newMeasurement.date || today}
                  onChange={e => setNewMeasurement({...newMeasurement, date: e.target.value})}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kilo ({wUnit})</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="75.5"
                    value={newMeasurement.weight || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, weight: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Vücut Yağı (tahmini)</label>
                  <div className={`bodyfat-estimate ${bodyFatEstimate ? '' : 'empty'}`} aria-live="polite">
                    <strong>{bodyFatEstimate ? `%${formatNumber(bodyFatEstimate.percent, 1)}` : '–'}</strong>
                    <span>
                      {!profile?.height
                        ? 'Tahmin için profilinde boy olmalı.'
                        : bodyFatEstimate?.method === 'navy'
                          ? 'Bel ve boyun ölçüne göre (ABD Donanması yöntemi)'
                          : bodyFatEstimate
                            ? `Boy-kilo-yaşa göre kaba tahmin. Bel + boyun${isFemaleProfile ? ' + kalça' : ''} girersen daha doğru olur.`
                            : 'Kilonu gir, otomatik hesaplansın.'}
                    </span>
                  </div>
                </div>
              </div>

              <h4><Ruler size="1em" aria-hidden="true" /> Çevre Ölçüleri ({lUnit === 'cm' ? 'cm' : 'inç'})</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Göğüs</label>
                  <input 
                    type="number" 
                    placeholder="100"
                    value={newMeasurement.chest || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, chest: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Bel</label>
                  <input 
                    type="number" 
                    placeholder="80"
                    value={newMeasurement.waist || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, waist: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Kalça</label>
                  <input 
                    type="number" 
                    placeholder="95"
                    value={newMeasurement.hips || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, hips: parseFloat(e.target.value) || undefined})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Biceps</label>
                  <input 
                    type="number" 
                    placeholder="35"
                    value={newMeasurement.biceps || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, biceps: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Bacak (Uyluk)</label>
                  <input 
                    type="number" 
                    placeholder="55"
                    value={newMeasurement.thighs || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, thighs: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Baldır</label>
                  <input 
                    type="number" 
                    placeholder="38"
                    value={newMeasurement.calves || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, calves: parseFloat(e.target.value) || undefined})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Boyun</label>
                <input 
                  type="number" 
                  placeholder="40"
                  style={{ maxWidth: '150px' }}
                  value={newMeasurement.neck || ''}
                  onChange={e => setNewMeasurement({...newMeasurement, neck: parseFloat(e.target.value) || undefined})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowMeasurementModal(false)}>
                İptal
              </button>
              <button className="btn-primary" onClick={saveMeasurement}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BodyTracking;

