import { useState, useEffect } from 'react';
import './BodyTracking.css';

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

export function BodyTracking() {
  const today = new Date().toISOString().split('T')[0];
  const [waterGoal, setWaterGoal] = useState(8);
  const [todayWater, setTodayWater] = useState(0);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    date: today
  });
  const [activeTab, setActiveTab] = useState<'water' | 'body'>('water');

  useEffect(() => {
    // LocalStorage'dan verileri yükle
    const savedWaterLogs = localStorage.getItem('waterLogs');
    const savedMeasurements = localStorage.getItem('bodyMeasurements');
    const savedWaterGoal = localStorage.getItem('waterGoal');
    
    if (savedWaterLogs) {
      const logs: WaterLog[] = JSON.parse(savedWaterLogs);
      setWaterLogs(logs);
      const todayLog = logs.find(l => l.date === today);
      if (todayLog) setTodayWater(todayLog.glasses);
    }
    
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
    
    if (savedWaterGoal) {
      setWaterGoal(parseInt(savedWaterGoal));
    }
  }, []);

  const addWater = (amount: number = 1) => {
    const newAmount = Math.max(0, todayWater + amount);
    setTodayWater(newAmount);
    
    const updatedLogs = waterLogs.filter(l => l.date !== today);
    updatedLogs.push({ date: today, glasses: newAmount });
    setWaterLogs(updatedLogs);
    localStorage.setItem('waterLogs', JSON.stringify(updatedLogs));
  };

  const updateWaterGoal = (goal: number) => {
    setWaterGoal(goal);
    localStorage.setItem('waterGoal', goal.toString());
  };

  const saveMeasurement = () => {
    const measurement: BodyMeasurement = {
      id: Date.now().toString(),
      date: newMeasurement.date || today,
      weight: newMeasurement.weight,
      bodyFat: newMeasurement.bodyFat,
      chest: newMeasurement.chest,
      waist: newMeasurement.waist,
      hips: newMeasurement.hips,
      biceps: newMeasurement.biceps,
      thighs: newMeasurement.thighs,
      calves: newMeasurement.calves,
      neck: newMeasurement.neck
    };
    
    const updatedMeasurements = [...measurements, measurement].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setMeasurements(updatedMeasurements);
    localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
    setShowMeasurementModal(false);
    setNewMeasurement({ date: today });
  };

  const deleteMeasurement = (id: string) => {
    const updatedMeasurements = measurements.filter(m => m.id !== id);
    setMeasurements(updatedMeasurements);
    localStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
  };

  const getProgressPercent = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getWeeklyWaterAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = waterLogs.filter(l => new Date(l.date) >= weekAgo);
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
        <h1>📏 Vücut Takibi</h1>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'water' ? 'active' : ''}`}
            onClick={() => setActiveTab('water')}
          >
            💧 Su Takibi
          </button>
          <button 
            className={`tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            📐 Vücut Ölçüleri
          </button>
        </div>

        {activeTab === 'water' ? (
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
                    <span className="water-icon">💧</span>
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
                    +{num} 💧
                  </button>
                ))}
              </div>

              {todayWater >= waterGoal && (
                <div className="goal-reached">
                  🎉 Günlük hedefinize ulaştınız!
                </div>
              )}
            </div>

            <div className="water-sidebar">
              {/* Hedef Ayarı */}
              <div className="water-goal-card card">
                <h3>🎯 Günlük Hedef</h3>
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
                <h3>📊 İstatistikler</h3>
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
                <h3>📅 Son 7 Gün</h3>
                <div className="history-bars">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
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
                <span className="summary-icon">⚖️</span>
                <span className="summary-value">
                  {getLatestMeasurement('weight') || '-'} kg
                </span>
                <span className="summary-label">Son Kilo</span>
                {weightChange !== null && (
                  <span className={`weight-change ${weightChange > 0 ? 'gain' : 'loss'}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </span>
                )}
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon">📊</span>
                <span className="summary-value">
                  {getLatestMeasurement('bodyFat') || '-'}%
                </span>
                <span className="summary-label">Vücut Yağı</span>
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon">📏</span>
                <span className="summary-value">
                  {getLatestMeasurement('waist') || '-'} cm
                </span>
                <span className="summary-label">Bel</span>
              </div>
              
              <div className="summary-card card">
                <span className="summary-icon">💪</span>
                <span className="summary-value">
                  {getLatestMeasurement('biceps') || '-'} cm
                </span>
                <span className="summary-label">Biceps</span>
              </div>
            </div>

            {/* Ölçüm Geçmişi */}
            <div className="measurements-history card">
              <h3>📋 Ölçüm Geçmişi</h3>
              
              {measurements.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📐</span>
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
                        <th>Kilo (kg)</th>
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
                          <td>{new Date(m.date).toLocaleDateString('tr-TR')}</td>
                          <td>{m.weight || '-'}</td>
                          <td>{m.bodyFat || '-'}</td>
                          <td>{m.chest || '-'}</td>
                          <td>{m.waist || '-'}</td>
                          <td>{m.hips || '-'}</td>
                          <td>{m.biceps || '-'}</td>
                          <td>{m.thighs || '-'}</td>
                          <td>
                            <button 
                              className="btn-icon delete"
                              onClick={() => deleteMeasurement(m.id)}
                            >
                              🗑️
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
              <h2>📏 Yeni Ölçüm</h2>
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
                  <label>Kilo (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="75.5"
                    value={newMeasurement.weight || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, weight: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="form-group">
                  <label>Vücut Yağı (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="15"
                    value={newMeasurement.bodyFat || ''}
                    onChange={e => setNewMeasurement({...newMeasurement, bodyFat: parseFloat(e.target.value) || undefined})}
                  />
                </div>
              </div>

              <h4>📐 Çevre Ölçüleri (cm)</h4>
              
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

