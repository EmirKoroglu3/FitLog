import { useState, useEffect } from 'react';
import './Settings.css';

interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  defaultRestTime: number;
  waterGoal: number;
  notifications: boolean;
  soundEffects: boolean;
  language: string;
  weightUnit: 'kg' | 'lbs';
  measurementUnit: 'cm' | 'inch';
}

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    accentColor: '#00d4aa',
    defaultRestTime: 90,
    waterGoal: 8,
    notifications: true,
    soundEffects: true,
    language: 'tr',
    weightUnit: 'kg',
    measurementUnit: 'cm'
  });
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState('');

  const accentColors = [
    { value: '#00d4aa', name: 'Turkuaz' },
    { value: '#3b82f6', name: 'Mavi' },
    { value: '#8b5cf6', name: 'Mor' },
    { value: '#ef4444', name: 'Kırmızı' },
    { value: '#f59e0b', name: 'Turuncu' },
    { value: '#22c55e', name: 'Yeşil' },
    { value: '#ec4899', name: 'Pembe' },
  ];

  const themeOptions = [
    { value: 'dark', label: 'Koyu', icon: '🌙' },
    { value: 'light', label: 'Açık', icon: '☀️' },
    { value: 'system', label: 'Sistem', icon: '💻' },
  ];

  useEffect(() => {
    // Kayıtlı ayarları yükle
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Tema değişikliğini uygula
    applyTheme(settings.theme);
    applyAccentColor(settings.accentColor);
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  };

  const applyAccentColor = (color: string) => {
    document.documentElement.style.setProperty('--color-accent-primary', color);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportAllData = () => {
    const allData = {
      workoutLogs: JSON.parse(localStorage.getItem('workoutLogs') || '[]'),
      waterLogs: JSON.parse(localStorage.getItem('waterLogs') || '[]'),
      bodyMeasurements: JSON.parse(localStorage.getItem('bodyMeasurements') || '[]'),
      fitnessGoals: JSON.parse(localStorage.getItem('fitnessGoals') || '[]'),
      oneRMRecords: JSON.parse(localStorage.getItem('oneRMRecords') || '[]'),
      achievements: JSON.parse(localStorage.getItem('achievements') || '{}'),
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    setExportData(JSON.stringify(allData, null, 2));
    setShowExportModal(true);
  };

  const downloadData = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const clearAllData = () => {
    if (confirm('Tüm verileriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      const keysToRemove = [
        'workoutLogs', 'waterLogs', 'bodyMeasurements', 
        'fitnessGoals', 'oneRMRecords', 'achievements'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert('Tüm veriler silindi.');
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1>⚙️ Ayarlar</h1>

        {/* Görünüm Ayarları */}
        <section className="settings-section card">
          <h2>🎨 Görünüm</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Tema</h3>
              <p>Uygulama temasını seçin</p>
            </div>
            <div className="theme-selector">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  className={`theme-btn ${settings.theme === option.value ? 'active' : ''}`}
                  onClick={() => updateSetting('theme', option.value as AppSettings['theme'])}
                >
                  <span className="theme-icon">{option.icon}</span>
                  <span className="theme-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Vurgu Rengi</h3>
              <p>Ana vurgu rengini seçin</p>
            </div>
            <div className="color-selector">
              {accentColors.map(color => (
                <button
                  key={color.value}
                  className={`color-btn ${settings.accentColor === color.value ? 'active' : ''}`}
                  style={{ background: color.value }}
                  onClick={() => updateSetting('accentColor', color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Antrenman Ayarları */}
        <section className="settings-section card">
          <h2>🏋️ Antrenman</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Varsayılan Dinlenme Süresi</h3>
              <p>Setler arası dinlenme süresi (saniye)</p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                value={settings.defaultRestTime}
                onChange={e => updateSetting('defaultRestTime', parseInt(e.target.value) || 60)}
                min="30"
                max="300"
                step="15"
              />
              <span className="unit">sn</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Ağırlık Birimi</h3>
              <p>Kilogram veya Pound</p>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${settings.weightUnit === 'kg' ? 'active' : ''}`}
                onClick={() => updateSetting('weightUnit', 'kg')}
              >
                kg
              </button>
              <button
                className={`toggle-btn ${settings.weightUnit === 'lbs' ? 'active' : ''}`}
                onClick={() => updateSetting('weightUnit', 'lbs')}
              >
                lbs
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Ölçü Birimi</h3>
              <p>Santimetre veya İnç</p>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${settings.measurementUnit === 'cm' ? 'active' : ''}`}
                onClick={() => updateSetting('measurementUnit', 'cm')}
              >
                cm
              </button>
              <button
                className={`toggle-btn ${settings.measurementUnit === 'inch' ? 'active' : ''}`}
                onClick={() => updateSetting('measurementUnit', 'inch')}
              >
                inç
              </button>
            </div>
          </div>
        </section>

        {/* Bildirim Ayarları */}
        <section className="settings-section card">
          <h2>🔔 Bildirimler</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Bildirimler</h3>
              <p>Uygulama bildirimlerini al</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={e => updateSetting('notifications', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Ses Efektleri</h3>
              <p>Timer biterken ses çalsın</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={e => updateSetting('soundEffects', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Veri Yönetimi */}
        <section className="settings-section card">
          <h2>💾 Veri Yönetimi</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Verileri Dışa Aktar</h3>
              <p>Tüm verilerinizi JSON formatında indirin</p>
            </div>
            <button className="btn-secondary" onClick={exportAllData}>
              📥 Dışa Aktar
            </button>
          </div>

          <div className="setting-item danger">
            <div className="setting-info">
              <h3>Tüm Verileri Sil</h3>
              <p>Tüm antrenman, beslenme ve ölçüm verilerini sil</p>
            </div>
            <button className="btn-danger" onClick={clearAllData}>
              🗑️ Verileri Sil
            </button>
          </div>
        </section>

        {/* Hakkında */}
        <section className="settings-section card about-section">
          <h2>ℹ️ Hakkında</h2>
          <div className="about-content">
            <div className="app-info">
              <span className="app-logo">💪</span>
              <div>
                <h3>FitLog</h3>
                <span className="version">v1.0.0</span>
              </div>
            </div>
            <p>
              Fitness yolculuğunuzu takip etmek için geliştirilen modern bir uygulama.
            </p>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">ASP.NET Core</span>
              <span className="tech-badge">PostgreSQL</span>
            </div>
          </div>
        </section>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📥 Veri Dışa Aktarma</h2>
              <button className="btn-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea 
                readOnly 
                value={exportData}
                className="export-preview"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                Kapat
              </button>
              <button className="btn-primary" onClick={downloadData}>
                💾 İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;

