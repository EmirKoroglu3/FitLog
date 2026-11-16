import { useEffect, useState } from 'react';
import { ProfileAnalysis, UpdateProfileRequest } from '../types/profile';
import profileService from '../services/profileService';
import './Profile.css';
import { BarChart3, Beef, BicepsFlexed, Cake, Dumbbell, Flame, Lightbulb, Pencil, Ruler, Scale, Target, TriangleAlert, UserRound } from 'lucide-react';

export function Profile() {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState<UpdateProfileRequest>({
    name: '',
    surname: '',
    height: undefined,
    weight: undefined,
    gender: '',
    birthDate: '',
    fitnessGoal: '',
    experienceLevel: '',
  });

  const genderOptions = ['Erkek', 'Kadın', 'Diğer'];
  const goalOptions = ['Kas Yapma', 'Kilo Verme', 'Güç Artırma', 'Genel Sağlık'];
  const levelOptions = ['Başlangıç', 'Orta', 'İleri'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAnalysis();
      setAnalysis(data);
      setForm({
        name: data.profile.name || '',
        surname: data.profile.surname || '',
        height: data.profile.height,
        weight: data.profile.weight,
        gender: data.profile.gender || '',
        birthDate: data.profile.birthDate ? data.profile.birthDate.split('T')[0] : '',
        fitnessGoal: data.profile.fitnessGoal || '',
        experienceLevel: data.profile.experienceLevel || '',
      });
    } catch (err) {
      setError('Profil yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await profileService.updateProfile(form);
      await fetchProfile();
      setEditMode(false);
      setSuccess('Profil başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getBmiColor = (bmi?: number) => {
    if (!bmi) return 'var(--color-text-muted)';
    if (bmi < 18.5) return '#3b82f6';
    if (bmi < 25) return '#22c55e';
    if (bmi < 30) return '#f59e0b';
    return '#ef4444';
  };

  const getBmiCategoryColor = (category?: string) => {
    switch (category) {
      case 'Zayıf': return 'var(--info)';
      case 'Normal': return 'var(--success)';
      case 'Fazla Kilolu': return 'var(--warning)';
      case 'Obez': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const profile = analysis?.profile;
  const isProfileComplete = profile?.height && profile?.weight && profile?.gender && profile?.birthDate;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1><UserRound size="1em" aria-hidden="true" /> Profilim</h1>
          {!editMode && (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <Pencil size="1em" aria-hidden="true" /> Düzenle
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {!isProfileComplete && !editMode && (
          <div className="profile-incomplete-banner">
            <span className="banner-icon"><TriangleAlert size="1em" aria-hidden="true" /></span>
            <div className="banner-content">
              <h3>Profilini Tamamla!</h3>
              <p>Boy, kilo ve diğer bilgilerini girerek kişiselleştirilmiş öneriler al.</p>
            </div>
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              Tamamla
            </button>
          </div>
        )}

        <div className="profile-layout">
          {/* Sol Panel - Profil Bilgileri */}
          <div className="profile-info-panel">
            {editMode ? (
              <form onSubmit={handleSubmit} className="profile-form card">
                <h2>Profil Bilgileri</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Ad</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Soyad</label>
                    <input
                      type="text"
                      value={form.surname}
                      onChange={e => setForm({...form, surname: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Boy (cm)</label>
                    <input
                      type="number"
                      value={form.height || ''}
                      onChange={e => setForm({...form, height: parseFloat(e.target.value) || undefined})}
                      placeholder="175"
                      min="100"
                      max="250"
                    />
                  </div>
                  <div className="form-group">
                    <label>Kilo (kg)</label>
                    <input
                      type="number"
                      value={form.weight || ''}
                      onChange={e => setForm({...form, weight: parseFloat(e.target.value) || undefined})}
                      placeholder="70"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cinsiyet</label>
                    <select
                      value={form.gender}
                      onChange={e => setForm({...form, gender: e.target.value})}
                    >
                      <option value="">Seçin...</option>
                      {genderOptions.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Doğum Tarihi</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={e => setForm({...form, birthDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fitness Hedefi</label>
                    <select
                      value={form.fitnessGoal}
                      onChange={e => setForm({...form, fitnessGoal: e.target.value})}
                    >
                      <option value="">Seçin...</option>
                      {goalOptions.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deneyim Seviyesi</label>
                    <select
                      value={form.experienceLevel}
                      onChange={e => setForm({...form, experienceLevel: e.target.value})}
                    >
                      <option value="">Seçin...</option>
                      {levelOptions.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-view card">
                <div className="profile-avatar">
                  <span className="avatar-icon">
                    <UserRound size="1em" aria-hidden="true" />
                  </span>
                  <h2>{profile?.name} {profile?.surname}</h2>
                  <p className="profile-email">{profile?.email}</p>
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-icon"><Ruler size="1em" aria-hidden="true" /></span>
                    <div className="stat-info">
                      <span className="stat-value">{profile?.height || '-'} cm</span>
                      <span className="stat-label">Boy</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon"><Scale size="1em" aria-hidden="true" /></span>
                    <div className="stat-info">
                      <span className="stat-value">{profile?.weight || '-'} kg</span>
                      <span className="stat-label">Kilo</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon"><Cake size="1em" aria-hidden="true" /></span>
                    <div className="stat-info">
                      <span className="stat-value">{profile?.age || '-'}</span>
                      <span className="stat-label">Yaş</span>
                    </div>
                  </div>
                </div>

                {profile?.bmi && (
                  <div className="bmi-section">
                    <h3>Vücut Kitle İndeksi (BMI)</h3>
                    <div className="bmi-display" style={{ borderColor: getBmiColor(profile.bmi) }}>
                      <span className="bmi-emoji" aria-hidden="true" style={{ display: 'inline-block', width: '0.75em', height: '0.75em', borderRadius: '50%', background: getBmiCategoryColor(profile.bmiCategory) }} />
                      <span className="bmi-value" style={{ color: getBmiColor(profile.bmi) }}>
                        {profile.bmi}
                      </span>
                      <span className="bmi-category">{profile.bmiCategory}</span>
                    </div>
                    <div className="bmi-scale">
                      <div className="scale-segment underweight" style={{ flex: 18.5 }}>Zayıf</div>
                      <div className="scale-segment normal" style={{ flex: 6.5 }}>Normal</div>
                      <div className="scale-segment overweight" style={{ flex: 5 }}>Fazla</div>
                      <div className="scale-segment obese" style={{ flex: 10 }}>Obez</div>
                    </div>
                  </div>
                )}

                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label"><Target size="1em" aria-hidden="true" /> Hedef</span>
                    <span className="detail-value">{profile?.fitnessGoal || 'Belirtilmedi'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><BarChart3 size="1em" aria-hidden="true" /> Seviye</span>
                    <span className="detail-value">{profile?.experienceLevel || 'Belirtilmedi'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sağ Panel - Tavsiyeler */}
          {!editMode && isProfileComplete && analysis && (
            <div className="profile-recommendations-panel">
              {/* Günlük İhtiyaçlar */}
              <div className="daily-needs card">
                <h3><BarChart3 size="1em" aria-hidden="true" /> Günlük İhtiyaçlarınız</h3>
                <div className="needs-grid">
                  <div className="need-item calories">
                    <span className="need-icon"><Flame size="1em" aria-hidden="true" /></span>
                    <span className="need-value">{analysis.dailyCalorieNeed}</span>
                    <span className="need-label">Kalori</span>
                  </div>
                  <div className="need-item protein">
                    <span className="need-icon"><Beef size="1em" aria-hidden="true" /></span>
                    <span className="need-value">{analysis.dailyProteinNeed}g</span>
                    <span className="need-label">Protein</span>
                  </div>
                </div>
              </div>

              {/* Önerilen Program */}
              <div className="suggested-program card">
                <h3><Dumbbell size="1em" aria-hidden="true" /> Önerilen Program</h3>
                <div className="program-suggestion">
                  <span className="suggestion-icon"><BicepsFlexed size="1em" aria-hidden="true" /></span>
                  <div className="suggestion-info">
                    <span className="suggestion-name">{analysis.suggestedProgram}</span>
                    <span className="suggestion-desc">Hedeflerinize ve seviyenize göre</span>
                  </div>
                </div>
              </div>

              {/* Tavsiyeler */}
              <div className="recommendations card">
                <h3><Lightbulb size="1em" aria-hidden="true" /> Kişisel Tavsiyeler</h3>
                <div className="recommendations-list">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="rec-icon">{rec.icon}</span>
                      <div className="rec-content">
                        <span className="rec-category">{rec.category}</span>
                        <h4>{rec.title}</h4>
                        <p>{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

