import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import './Goals.css';

interface Goal {
  id: string;
  title: string;
  category: 'weight' | 'strength' | 'body' | 'habit' | 'nutrition';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  createdAt: string;
  completed: boolean;
}

interface OneRMRecord {
  exercise: string;
  weight: number;
  date: string;
}

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'calculator'>('goals');
  
  // Yeni hedef formu
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    category: 'strength'
  });
  
  // 1RM Hesaplayıcı
  const [calcWeight, setCalcWeight] = useState<number>(0);
  const [calcReps, setCalcReps] = useState<number>(0);
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcExercise, setCalcExercise] = useState('');
  const [oneRMRecords, setOneRMRecords] = useState<OneRMRecord[]>([]);

  // Kullanıcı bazlı localStorage key
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;

  const categoryOptions = [
    { value: 'strength', label: 'Güç/Kaldırma', icon: '🏋️' },
    { value: 'weight', label: 'Kilo', icon: '⚖️' },
    { value: 'body', label: 'Vücut Ölçüsü', icon: '📏' },
    { value: 'habit', label: 'Alışkanlık', icon: '✅' },
    { value: 'nutrition', label: 'Beslenme', icon: '🍎' }
  ];

  const commonExercises = [
    'Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 
    'Barbell Row', 'Pull-up', 'Dips', 'Leg Press'
  ];

  useEffect(() => {
    if (!user) return;
    
    const savedGoals = localStorage.getItem(getStorageKey('fitnessGoals'));
    const savedRecords = localStorage.getItem(getStorageKey('oneRMRecords'));
    
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedRecords) setOneRMRecords(JSON.parse(savedRecords));
  }, [user]);

  const saveGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title || '',
      category: newGoal.category as Goal['category'] || 'strength',
      targetValue: newGoal.targetValue || 0,
      currentValue: newGoal.currentValue || 0,
      unit: newGoal.unit || '',
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    const updated = [...goals, goal];
    setGoals(updated);
    localStorage.setItem(getStorageKey('fitnessGoals'), JSON.stringify(updated));
    setShowGoalModal(false);
    setNewGoal({ category: 'strength' });
  };

  const updateGoalProgress = (id: string, currentValue: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const completed = currentValue >= g.targetValue;
        return { ...g, currentValue, completed };
      }
      return g;
    });
    setGoals(updated);
    localStorage.setItem(getStorageKey('fitnessGoals'), JSON.stringify(updated));
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem(getStorageKey('fitnessGoals'), JSON.stringify(updated));
  };

  // 1RM Hesaplama (Brzycki Formülü)
  const calculate1RM = () => {
    if (calcWeight <= 0 || calcReps <= 0) return;
    
    // Brzycki formülü: 1RM = weight × (36 / (37 - reps))
    const oneRM = calcWeight * (36 / (37 - calcReps));
    setCalcResult(Math.round(oneRM * 10) / 10);
  };

  const save1RMRecord = () => {
    if (!calcResult || !calcExercise) return;
    
    const record: OneRMRecord = {
      exercise: calcExercise,
      weight: calcResult,
      date: new Date().toISOString()
    };
    
    const updated = [...oneRMRecords, record];
    setOneRMRecords(updated);
    localStorage.setItem(getStorageKey('oneRMRecords'), JSON.stringify(updated));
    setShowCalcModal(true);
  };

  const getPercentages = (oneRM: number) => {
    return [
      { percent: 100, weight: oneRM, reps: 1 },
      { percent: 95, weight: oneRM * 0.95, reps: 2 },
      { percent: 90, weight: oneRM * 0.90, reps: 4 },
      { percent: 85, weight: oneRM * 0.85, reps: 6 },
      { percent: 80, weight: oneRM * 0.80, reps: 8 },
      { percent: 75, weight: oneRM * 0.75, reps: 10 },
      { percent: 70, weight: oneRM * 0.70, reps: 12 },
      { percent: 65, weight: oneRM * 0.65, reps: 15 },
    ];
  };

  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getLatest1RM = (exercise: string) => {
    const records = oneRMRecords.filter(r => r.exercise === exercise);
    if (records.length === 0) return null;
    return records[records.length - 1];
  };

  const getCategoryIcon = (category: string) => {
    return categoryOptions.find(c => c.value === category)?.icon || '🎯';
  };

  return (
    <div className="goals-page">
      <div className="container">
        <div className="goals-header">
          <h1>🎯 Hedefler & Araçlar</h1>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Hedeflerim
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            🔢 1RM Hesaplayıcı
          </button>
        </div>

        {activeTab === 'goals' ? (
          /* Hedefler Tab */
          <div className="goals-content">
            <div className="goals-actions">
              <button className="btn-primary" onClick={() => setShowGoalModal(true)}>
                + Yeni Hedef
              </button>
            </div>

            {/* Aktif Hedefler */}
            <div className="goals-section">
              <h2>📌 Aktif Hedefler</h2>
              
              {goals.filter(g => !g.completed).length === 0 ? (
                <div className="empty-state card">
                  <span className="empty-icon">🎯</span>
                  <p>Henüz aktif hedef yok</p>
                  <button className="btn-primary" onClick={() => setShowGoalModal(true)}>
                    İlk Hedefini Belirle
                  </button>
                </div>
              ) : (
                <div className="goals-grid">
                  {goals.filter(g => !g.completed).map(goal => (
                    <div key={goal.id} className="goal-card card">
                      <div className="goal-header">
                        <span className="goal-icon">{getCategoryIcon(goal.category)}</span>
                        <div className="goal-info">
                          <h3>{goal.title}</h3>
                          <span className="goal-category">
                            {categoryOptions.find(c => c.value === goal.category)?.label}
                          </span>
                        </div>
                        <button 
                          className="btn-icon delete"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${getProgressPercent(goal.currentValue, goal.targetValue)}%` }}
                          />
                        </div>
                        <div className="progress-text">
                          <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          <span>{Math.round(getProgressPercent(goal.currentValue, goal.targetValue))}%</span>
                        </div>
                      </div>

                      <div className="goal-update">
                        <input 
                          type="number"
                          value={goal.currentValue}
                          onChange={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value) || 0)}
                          placeholder="Mevcut değer"
                        />
                        <span className="unit">{goal.unit}</span>
                      </div>

                      {goal.deadline && (
                        <div className="goal-deadline">
                          📅 {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tamamlanan Hedefler */}
            {goals.filter(g => g.completed).length > 0 && (
              <div className="goals-section completed-section">
                <h2>✅ Tamamlanan Hedefler</h2>
                <div className="completed-goals">
                  {goals.filter(g => g.completed).map(goal => (
                    <div key={goal.id} className="completed-goal-item">
                      <span className="check">✅</span>
                      <span className="title">{goal.title}</span>
                      <span className="value">{goal.targetValue} {goal.unit}</span>
                      <button 
                        className="btn-icon"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 1RM Hesaplayıcı Tab */
          <div className="calculator-content">
            <div className="calc-layout">
              {/* Hesaplayıcı */}
              <div className="calculator-card card">
                <h2>🔢 1RM Hesaplayıcı</h2>
                <p className="calc-description">
                  Kaldırdığınız ağırlık ve tekrar sayısına göre tahmini maksimum kaldırma ağırlığınızı hesaplayın.
                </p>

                <div className="calc-form">
                  <div className="form-group">
                    <label>Egzersiz</label>
                    <select 
                      value={calcExercise}
                      onChange={e => setCalcExercise(e.target.value)}
                    >
                      <option value="">Seçin (opsiyonel)</option>
                      {commonExercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ağırlık (kg)</label>
                      <input 
                        type="number"
                        value={calcWeight || ''}
                        onChange={e => setCalcWeight(parseFloat(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tekrar Sayısı</label>
                      <input 
                        type="number"
                        value={calcReps || ''}
                        onChange={e => setCalcReps(parseInt(e.target.value) || 0)}
                        placeholder="5"
                        min="1"
                        max="15"
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-primary btn-calc"
                    onClick={calculate1RM}
                    disabled={calcWeight <= 0 || calcReps <= 0}
                  >
                    Hesapla
                  </button>
                </div>

                {calcResult && (
                  <div className="calc-result">
                    <div className="result-main">
                      <span className="result-label">Tahmini 1RM</span>
                      <span className="result-value">{calcResult} kg</span>
                    </div>
                    
                    {calcExercise && (
                      <button 
                        className="btn-secondary btn-save"
                        onClick={save1RMRecord}
                      >
                        💾 Kaydet
                      </button>
                    )}

                    {/* Yüzde Tablosu */}
                    <div className="percentages-table">
                      <h4>📊 Antrenman Yüzdeleri</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>%</th>
                            <th>Ağırlık</th>
                            <th>~Tekrar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPercentages(calcResult).map(p => (
                            <tr key={p.percent} className={p.percent === 100 ? 'highlight' : ''}>
                              <td>{p.percent}%</td>
                              <td>{Math.round(p.weight)} kg</td>
                              <td>{p.reps}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 1RM Geçmişi */}
              <div className="records-sidebar">
                <div className="records-card card">
                  <h3>📈 1RM Rekorlarım</h3>
                  
                  {oneRMRecords.length === 0 ? (
                    <p className="no-records">Henüz kayıt yok</p>
                  ) : (
                    <div className="records-list">
                      {commonExercises.map(exercise => {
                        const record = getLatest1RM(exercise);
                        if (!record) return null;
                        
                        return (
                          <div key={exercise} className="record-item">
                            <span className="record-exercise">{exercise}</span>
                            <span className="record-weight">{record.weight} kg</span>
                            <span className="record-date">
                              {new Date(record.date).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Formül Açıklaması */}
                <div className="formula-card card">
                  <h3>📚 Brzycki Formülü</h3>
                  <div className="formula">
                    <code>1RM = W × (36 / (37 - R))</code>
                  </div>
                  <p>
                    W = Kaldırılan ağırlık<br />
                    R = Tekrar sayısı (1-15 arası)
                  </p>
                  <p className="note">
                    Not: Bu bir tahmindir, gerçek 1RM farklı olabilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Yeni Hedef Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎯 Yeni Hedef</h2>
              <button className="btn-close" onClick={() => setShowGoalModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Hedef Başlığı</label>
                <input 
                  type="text"
                  placeholder="Örn: Squat 150kg"
                  value={newGoal.title || ''}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select 
                  value={newGoal.category || 'strength'}
                  onChange={e => setNewGoal({...newGoal, category: e.target.value as Goal['category']})}
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mevcut Değer</label>
                  <input 
                    type="number"
                    placeholder="100"
                    value={newGoal.currentValue || ''}
                    onChange={e => setNewGoal({...newGoal, currentValue: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label>Hedef Değer</label>
                  <input 
                    type="number"
                    placeholder="150"
                    value={newGoal.targetValue || ''}
                    onChange={e => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label>Birim</label>
                  <input 
                    type="text"
                    placeholder="kg"
                    value={newGoal.unit || ''}
                    onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hedef Tarihi (Opsiyonel)</label>
                <input 
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowGoalModal(false)}>
                İptal
              </button>
              <button 
                className="btn-primary" 
                onClick={saveGoal}
                disabled={!newGoal.title || !newGoal.targetValue}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kayıt Başarılı Modal */}
      {showCalcModal && (
        <div className="modal-overlay" onClick={() => setShowCalcModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <div className="success-modal">
              <span className="success-icon">✅</span>
              <h3>{calcExercise} için 1RM kaydedildi!</h3>
              <p>{calcResult} kg</p>
              <button className="btn-primary" onClick={() => setShowCalcModal(false)}>
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;

