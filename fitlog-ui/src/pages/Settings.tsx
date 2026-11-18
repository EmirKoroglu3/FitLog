import { useEffect, useState } from 'react';
import './Settings.css';
import { Settings as SettingsIcon, Bell, BicepsFlexed, Compass, Download, Dumbbell, FileSpreadsheet, Info, Palette, Save, Utensils, Wand2 } from 'lucide-react';
import { AppIcon } from '../components/AppIcon';
import { useTheme, type ThemePreference } from '../store/ThemeContext';
import { useSettings } from '../store/SettingsContext';
import { bodyApi, customFoodsApi, goalsApi, sessionsApi, type UserSettings } from '../services/trackingService';
import nutritionService from '../services/nutritionService';
import profileService from '../services/profileService';
import { toLocalDateInput } from '../utils/dateTime';
import { useI18n } from '../i18n/I18nContext';

const themeOptions: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Açık', icon: 'Sun' },
  { value: 'dark', label: 'Koyu', icon: 'Moon' },
  { value: 'system', label: 'Sistem', icon: 'Monitor' },
];

type TargetKey = 'calorieTarget' | 'proteinTarget' | 'carbTarget' | 'fatTarget';
const targetFields: { key: TargetKey; label: string; unit: string; max: number }[] = [
  { key: 'calorieTarget', label: 'Kalori', unit: 'kcal', max: 10000 },
  { key: 'proteinTarget', label: 'Protein', unit: 'g', max: 600 },
  { key: 'carbTarget', label: 'Karbonhidrat', unit: 'g', max: 1500 },
  { key: 'fatTarget', label: 'Yağ', unit: 'g', max: 500 },
];

const download = (content: string, type: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  // Escape quotes and neutralise spreadsheet formula injection
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function Settings() {
  const { t } = useI18n();
  const { preference, setPreference } = useTheme();
  const { settings, update } = useSettings();
  const [targets, setTargets] = useState<Record<TargetKey, string>>({ calorieTarget: '', proteinTarget: '', carbTarget: '', fatTarget: '' });
  const [restInput, setRestInput] = useState(String(settings.defaultRestSeconds));
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTargets({
      calorieTarget: settings.calorieTarget?.toString() ?? '',
      proteinTarget: settings.proteinTarget?.toString() ?? '',
      carbTarget: settings.carbTarget?.toString() ?? '',
      fatTarget: settings.fatTarget?.toString() ?? '',
    });
    setRestInput(String(settings.defaultRestSeconds));
  }, [settings]);

  const save = async (patch: Partial<UserSettings>, okText = 'Kaydedildi') => {
    try {
      await update(patch);
      setMessage({ type: 'ok', text: okText });
    } catch {
      setMessage({ type: 'error', text: 'Ayar kaydedilemedi. Değerleri kontrol et.' });
    }
  };

  const saveTargets = () => {
    const patch: Partial<UserSettings> = {};
    targetFields.forEach(({ key }) => {
      const n = Number(targets[key]);
      patch[key] = targets[key] === '' || !Number.isFinite(n) || n <= 0 ? null : Math.round(n);
    });
    save(patch, 'Günlük hedefler kaydedildi');
  };

  /** Suggests targets from the profile: kcal from TDEE, protein from profile, 25% fat, rest carbs. */
  const suggestTargets = async () => {
    try {
      const a = await profileService.getAnalysis();
      const kcal = a.dailyCalorieNeed;
      const protein = a.dailyProteinNeed;
      const fat = Math.round((kcal * 0.25) / 9);
      const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
      setTargets({ calorieTarget: String(kcal), proteinTarget: String(protein), carbTarget: String(carbs), fatTarget: String(fat) });
      setMessage({ type: 'ok', text: 'Profiline göre hesaplandı — kaydetmeyi unutma.' });
    } catch {
      setMessage({ type: 'error', text: 'Önce profilinde boy, kilo, yaş ve hedefini doldur.' });
    }
  };

  const toggleNotifications = async (on: boolean) => {
    if (on && 'Notification' in window && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        setMessage({ type: 'error', text: 'Tarayıcı bildirim iznini reddetti.' });
        return;
      }
    }
    save({ notifications: on });
  };

  const exportJson = async () => {
    setBusy(true);
    try {
      const yearsAgo = new Date();
      yearsAgo.setFullYear(yearsAgo.getFullYear() - 5);
      const [sessions, measurements, water, goals, oneRepMax, customFoods, nutrition] = await Promise.all([
        sessionsApi.list({ includeSets: true }),
        bodyApi.measurements(),
        bodyApi.water(toLocalDateInput(new Date(Date.now() - 365 * 86400000)), toLocalDateInput()),
        goalsApi.list(),
        goalsApi.oneRepMax(),
        customFoodsApi.list(),
        nutritionService.getLogs(yearsAgo.toISOString(), new Date().toISOString()),
      ]);
      const data = { exportedAt: new Date().toISOString(), settings, sessions, measurements, water, goals, oneRepMax, customFoods, nutrition };
      download(JSON.stringify(data, null, 2), 'application/json', `fitlog-yedek-${toLocalDateInput()}.json`);
    } catch {
      setMessage({ type: 'error', text: 'Veriler dışa aktarılamadı.' });
    } finally {
      setBusy(false);
    }
  };

  const exportSetsCsv = async () => {
    setBusy(true);
    try {
      const sessions = await sessionsApi.list({ includeSets: true });
      const rows = [['Tarih', 'Antrenman', 'Egzersiz', 'Set', 'Tekrar', 'Ağırlık (kg)', 'RPE', 'Isınma']];
      [...sessions].reverse().forEach((s) =>
        s.sets.forEach((x) =>
          rows.push([
            new Date(s.startedAt).toLocaleString('tr-TR'),
            s.name,
            x.exerciseName,
            String(x.setNumber),
            String(x.reps),
            String(x.weightKg),
            x.rpe?.toString() ?? '',
            x.isWarmup ? 'Evet' : '',
          ]),
        ),
      );
      // BOM so Excel opens UTF-8 (Turkish characters) correctly
      download('﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\n'), 'text/csv;charset=utf-8', `fitlog-setler-${toLocalDateInput()}.csv`);
    } catch {
      setMessage({ type: 'error', text: 'CSV oluşturulamadı.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1><SettingsIcon size="1em" aria-hidden="true" /> {t("Ayarlar")}</h1>

        {message && (
          <div className={message.type === 'ok' ? 'success-banner' : 'error-banner'} role="status">
            {message.text}
          </div>
        )}

        {/* Görünüm */}
        <section className="settings-section card">
          <h2><Palette size="1em" aria-hidden="true" /> {t("Görünüm")}</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>{t("Tema")}</h3>
              <p>{t("Uygulama temasını seçin")}</p>
            </div>
            <div className="theme-selector">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  className={`theme-btn ${preference === option.value ? 'active' : ''}`}
                  onClick={() => setPreference(option.value)}
                  aria-pressed={preference === option.value}
                >
                  <span className="theme-icon"><AppIcon name={option.icon} /></span>
                  <span className="theme-label">{t(option.label)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Dil / Language</h3>
              <p>{t("Arayüz dili")}</p>
            </div>
            <div className="toggle-group">
              {(['tr', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  className={`toggle-btn ${settings.language === lang ? 'active' : ''}`}
                  onClick={() => save({ language: lang })}
                  aria-pressed={settings.language === lang}
                >
                  {lang === 'tr' ? 'Türkçe' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Beslenme hedefleri */}
        <section className="settings-section card">
          <h2><Utensils size="1em" aria-hidden="true" /> {t("Günlük Beslenme Hedefleri")}</h2>
          <p className="section-hint">
            Panel ve Beslenme sayfasında ilerlemen bu hedeflere göre gösterilir. Boş bırakılan hedef gösterilmez.
          </p>
          <div className="targets-grid">
            {targetFields.map(f => (
              <label key={f.key} className="target-field">
                <span>{t(f.label)}</span>
                <div className="setting-control">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={f.max}
                    value={targets[f.key]}
                    onChange={e => setTargets({ ...targets, [f.key]: e.target.value })}
                    placeholder="—"
                  />
                  <span className="unit">{f.unit}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="section-actions">
            <button className="btn-secondary" onClick={suggestTargets}>
              <Wand2 size="1em" aria-hidden="true" /> {t("Profilden hesapla")}
            </button>
            <button className="btn-primary" onClick={saveTargets}>
              <Save size="1em" aria-hidden="true" /> {t("Hedefleri Kaydet")}
            </button>
          </div>
        </section>

        {/* Antrenman */}
        <section className="settings-section card">
          <h2><Dumbbell size="1em" aria-hidden="true" /> {t("Antrenman")}</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>{t("Varsayılan Dinlenme Süresi")}</h3>
              <p>Antrenman modunda setler arası dinlenme</p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                value={restInput}
                onChange={e => setRestInput(e.target.value)}
                onBlur={() => {
                  const v = Math.min(600, Math.max(15, Number(restInput) || 90));
                  setRestInput(String(v));
                  if (v !== settings.defaultRestSeconds) save({ defaultRestSeconds: v });
                }}
                min="15"
                max="600"
                step="15"
              />
              <span className="unit">sn</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>{t("Ağırlık Birimi")}</h3>
              <p>Veriler kg olarak saklanır, seçtiğin birimde gösterilir</p>
            </div>
            <div className="toggle-group">
              {(['kg', 'lbs'] as const).map(u => (
                <button
                  key={u}
                  className={`toggle-btn ${settings.weightUnit === u ? 'active' : ''}`}
                  onClick={() => save({ weightUnit: u })}
                  aria-pressed={settings.weightUnit === u}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>{t("Ölçü Birimi")}</h3>
              <p>Vücut ölçüleri için</p>
            </div>
            <div className="toggle-group">
              {(['cm', 'inch'] as const).map(u => (
                <button
                  key={u}
                  className={`toggle-btn ${settings.measurementUnit === u ? 'active' : ''}`}
                  onClick={() => save({ measurementUnit: u })}
                  aria-pressed={settings.measurementUnit === u}
                >
                  {u === 'cm' ? 'cm' : 'inç'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Bildirimler */}
        <section className="settings-section card">
          <h2><Bell size="1em" aria-hidden="true" /> {t("Bildirimler")}</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Dinlenme bildirimi</h3>
              <p>Uygulama arka plandayken dinlenme bitince bildirim gönder</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={e => toggleNotifications(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>{t("Ses Efektleri")}</h3>
              <p>Dinlenme sayacı bitince ses çalsın</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={e => save({ soundEffects: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Veri */}
        <section className="settings-section card">
          <h2><Save size="1em" aria-hidden="true" /> {t("Verilerin")}</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Tüm verileri indir (JSON)</h3>
              <p>Antrenmanlar, setler, öğünler, ölçümler, hedefler ve ayarların yedeği</p>
            </div>
            <button className="btn-secondary" onClick={exportJson} disabled={busy}>
              <Download size="1em" aria-hidden="true" /> JSON
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Set geçmişi (CSV)</h3>
              <p>Excel / Google Sheets'te açmak için</p>
            </div>
            <button className="btn-secondary" onClick={exportSetsCsv} disabled={busy}>
              <FileSpreadsheet size="1em" aria-hidden="true" /> CSV
            </button>
          </div>
        </section>

        {/* Hakkında */}
        <section className="settings-section card">
          <h2><Compass size="1em" aria-hidden="true" /> {t("Tanıtım turu")}</h2>
          <p className="settings-hint">{t("Uygulamanın hangi bölümünde ne yapıldığını gösteren kısa turu yeniden izle.")}</p>
          <button type="button" className="btn-secondary" onClick={() => update({ onboardingDone: false })}>
            <Compass size="1em" aria-hidden="true" /> {t("Turu tekrar göster")}
          </button>
        </section>

        <section className="settings-section card about-section">
          <h2><Info size="1em" aria-hidden="true" /> {t("Hakkında")}</h2>
          <div className="about-content">
            <div className="app-info">
              <span className="app-logo"><BicepsFlexed size="1em" aria-hidden="true" /></span>
              <div>
                <h3>FitLog</h3>
                <span className="version">v1.1.0</span>
              </div>
            </div>
            <p>Antrenman, beslenme ve gelişim takibi için geliştirilmiş açık kaynak bir uygulama.</p>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">ASP.NET Core</span>
              <span className="tech-badge">PostgreSQL</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
