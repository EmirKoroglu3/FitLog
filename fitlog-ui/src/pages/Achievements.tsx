import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import './Achievements.css';
import { toLocalDateInput } from '../utils/dateTime';
import { CircleCheck, Lock, PartyPopper, Sparkles, Trophy } from 'lucide-react';
import { AppIcon } from '../components/AppIcon';
import { useSettings } from '../store/SettingsContext';
import { sessionsApi, bodyApi } from '../services/trackingService';
import nutritionService from '../services/nutritionService';
import profileService from '../services/profileService';
import workoutService from '../services/workoutService';
import { computeAchievementProgress } from '../utils/achievementMetrics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'nutrition' | 'streak' | 'strength' | 'consistency' | 'special';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  
  // Kullanıcı bazlı localStorage key
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;
  const { settings, loaded: settingsLoaded } = useSettings();
  const [loadError, setLoadError] = useState(false);

  const achievementDefinitions: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedDate'>[] = [
    // Workout Achievements
    { id: 'first_workout', title: 'İlk Adım', description: 'İlk antrenmanını tamamla', icon: 'PartyPopper', category: 'workout', requirement: 1, rarity: 'common' },
    { id: 'workout_10', title: 'Başlangıç', description: '10 antrenman tamamla', icon: 'BicepsFlexed', category: 'workout', requirement: 10, rarity: 'common' },
    { id: 'workout_25', title: 'Kararlı', description: '25 antrenman tamamla', icon: 'Flame', category: 'workout', requirement: 25, rarity: 'rare' },
    { id: 'workout_50', title: 'Adanmış', description: '50 antrenman tamamla', icon: 'Zap', category: 'workout', requirement: 50, rarity: 'rare' },
    { id: 'workout_100', title: 'Makine', description: '100 antrenman tamamla', icon: 'Bot', category: 'workout', requirement: 100, rarity: 'epic' },
    { id: 'workout_250', title: 'Efsane', description: '250 antrenman tamamla', icon: 'Crown', category: 'workout', requirement: 250, rarity: 'legendary' },
    
    // Streak Achievements
    { id: 'streak_3', title: 'Üç Gün', description: '3 gün üst üste antrenman yap', icon: 'Link2', category: 'streak', requirement: 3, rarity: 'common' },
    { id: 'streak_7', title: 'Bir Hafta', description: '7 gün üst üste antrenman yap', icon: 'CalendarDays', category: 'streak', requirement: 7, rarity: 'common' },
    { id: 'streak_14', title: 'İki Hafta', description: '14 gün üst üste antrenman yap', icon: 'Star', category: 'streak', requirement: 14, rarity: 'rare' },
    { id: 'streak_30', title: 'Bir Ay', description: '30 gün üst üste antrenman yap', icon: 'Trophy', category: 'streak', requirement: 30, rarity: 'epic' },
    { id: 'streak_100', title: 'Kesintisiz', description: '100 gün üst üste antrenman yap', icon: 'Gem', category: 'streak', requirement: 100, rarity: 'legendary' },
    
    // Consistency Achievements
    { id: 'week_complete', title: 'Tam Hafta', description: 'Bir haftada tüm günleri tamamla', icon: 'CircleCheck', category: 'consistency', requirement: 7, rarity: 'rare' },
    { id: 'month_active', title: 'Aktif Ay', description: 'Bir ayda 20+ antrenman yap', icon: 'BarChart3', category: 'consistency', requirement: 20, rarity: 'rare' },
    { id: 'early_bird', title: 'Erken Kuş', description: 'Sabah 7\'den önce antrenman yap', icon: 'Sunrise', category: 'consistency', requirement: 1, rarity: 'common' },
    { id: 'night_owl', title: 'Gece Kuşu', description: 'Gece 22\'den sonra antrenman yap', icon: 'Moon', category: 'consistency', requirement: 1, rarity: 'common' },
    
    // Strength Achievements
    { id: 'first_pr', title: 'İlk PR', description: 'İlk kişisel rekorunu kır', icon: 'TrendingUp', category: 'strength', requirement: 1, rarity: 'common' },
    { id: 'pr_5', title: 'Rekor Avcısı', description: '5 kişisel rekor kır', icon: 'Target', category: 'strength', requirement: 5, rarity: 'rare' },
    { id: 'bench_100', title: 'Bench Press 100kg', description: 'Bench Press\'te 100kg kaldır', icon: 'Dumbbell', category: 'strength', requirement: 100, rarity: 'epic' },
    { id: 'squat_140', title: 'Squat 140kg', description: 'Squat\'ta 140kg kaldır', icon: 'Footprints', category: 'strength', requirement: 140, rarity: 'epic' },
    { id: 'deadlift_180', title: 'Deadlift 180kg', description: 'Deadlift\'te 180kg kaldır', icon: 'BicepsFlexed', category: 'strength', requirement: 180, rarity: 'legendary' },
    
    // Nutrition Achievements
    { id: 'water_goal', title: 'Su Uzmanı', description: '7 gün üst üste su hedefini tamamla', icon: 'Droplet', category: 'nutrition', requirement: 7, rarity: 'common' },
    { id: 'nutrition_log_7', title: 'Özenli', description: '7 gün üst üste yemek kaydı tut', icon: 'NotebookPen', category: 'nutrition', requirement: 7, rarity: 'common' },
    { id: 'protein_goal', title: 'Protein Kralı', description: '7 gün üst üste protein hedefini tamamla', icon: 'Beef', category: 'nutrition', requirement: 7, rarity: 'rare' },
    
    // Special Achievements
    { id: 'profile_complete', title: 'Profil Tamamlandı', description: 'Profilini tamamen doldur', icon: 'UserRound', category: 'special', requirement: 1, rarity: 'common' },
    { id: 'first_program', title: 'Planlamacı', description: 'İlk antrenman programını oluştur', icon: 'ClipboardList', category: 'special', requirement: 1, rarity: 'common' },
    { id: 'body_measurement', title: 'Takipçi', description: 'İlk vücut ölçümünü kaydet', icon: 'Ruler', category: 'special', requirement: 1, rarity: 'common' },
  ];

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    all: { label: 'Tümü', icon: 'Medal' },
    workout: { label: 'Antrenman', icon: 'Dumbbell' },
    streak: { label: 'Streak', icon: 'Flame' },
    consistency: { label: 'Düzenlilik', icon: 'CalendarDays' },
    strength: { label: 'Güç', icon: 'BicepsFlexed' },
    nutrition: { label: 'Beslenme', icon: 'Apple' },
    special: { label: 'Özel', icon: 'Star' },
  };

  const rarityColors: Record<string, string> = {
    // Dark enough for white badge text (WCAG AA) in both themes
    common: '#6b7280',
    rare: '#2563eb',
    epic: '#9333ea',
    legendary: '#b45309',
  };

  useEffect(() => {
    if (user && settingsLoaded) {
      calculateAchievements();
    }
  }, [user, settingsLoaded]);

  const calculateAchievements = async () => {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    let progress: Record<string, number>;
    try {
      const [sessions, water, measurements, nutritionLogs, profile, programs] = await Promise.all([
        sessionsApi.list({ includeSets: true }),
        bodyApi.water(toLocalDateInput(yearAgo), toLocalDateInput()),
        bodyApi.measurements(),
        nutritionService.getLogs(yearAgo.toISOString(), new Date().toISOString()),
        profileService.getProfile().catch(() => null),
        workoutService.getPrograms(),
      ]);
      progress = computeAchievementProgress({
        sessions,
        water,
        waterGoal: settings.waterGoalGlasses,
        measurements,
        nutritionLogs,
        proteinTarget: settings.proteinTarget,
        profile,
        programCount: programs.length,
      });
    } catch {
      setLoadError(true);
      return;
    }

    // Which unlocks this browser has already celebrated (only drives the pop-up)
    const seen: Record<string, string> = JSON.parse(localStorage.getItem(getStorageKey('achievementsSeen')) || '{}');
    let firstNew: Achievement | null = null;

    const calculated = achievementDefinitions.map(def => {
      const currentProgress = progress[def.id] ?? 0;
      const unlocked = currentProgress >= def.requirement;
      if (unlocked && !seen[def.id]) {
        seen[def.id] = new Date().toISOString();
        firstNew ??= { ...def, currentProgress, unlocked, unlockedDate: seen[def.id] } as Achievement;
      }
      return { ...def, currentProgress, unlocked, unlockedDate: unlocked ? seen[def.id] : undefined } as Achievement;
    });

    setAchievements(calculated);
    localStorage.setItem(getStorageKey('achievementsSeen'), JSON.stringify(seen));
    if (firstNew) {
      setNewlyUnlocked(firstNew);
      setShowUnlockModal(true);
    }
  };

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === filter);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="achievements-page">
      <div className="container">
        <div className="achievements-header">
          <h1><Trophy size="1em" aria-hidden="true" /> Başarılar</h1>
          {loadError && <p className="error-banner" role="alert">Başarılar hesaplanamadı, sayfayı yenile.</p>}
          <div className="achievements-stats">
            <span className="stat-text">{unlockedCount} / {totalCount}</span>
            <div className="stat-bar">
              <div 
                className="stat-fill" 
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              <span className="filter-icon"><AppIcon name={icon} /></span>
              <span className="filter-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              style={{ '--rarity-color': rarityColors[achievement.rarity] } as React.CSSProperties}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? <AppIcon name={achievement.icon} /> : <Lock size="1em" aria-hidden="true" />}
              </div>
              
              <div className="achievement-info">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                
                {!achievement.unlocked && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {achievement.currentProgress} / {achievement.requirement}
                    </span>
                  </div>
                )}
                
                {achievement.unlocked && achievement.unlockedDate && (
                  <span className="unlock-date">
                    <CircleCheck size="1em" aria-hidden="true" /> {new Date(achievement.unlockedDate).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>

              <div 
                className="rarity-badge"
                style={{ background: rarityColors[achievement.rarity] }}
              >
                {achievement.rarity === 'common' && 'Yaygın'}
                {achievement.rarity === 'rare' && 'Nadir'}
                {achievement.rarity === 'epic' && 'Epik'}
                {achievement.rarity === 'legendary' && 'Efsanevi'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && newlyUnlocked && (
        <div className="modal-overlay" onClick={() => setShowUnlockModal(false)}>
          <div 
            className="unlock-modal force-dark"
            onClick={e => e.stopPropagation()}
            style={{ '--rarity-color': rarityColors[newlyUnlocked.rarity] } as React.CSSProperties}
          >
            <div className="unlock-animation">
              <div className="unlock-icon"><AppIcon name={newlyUnlocked.icon} /></div>
              <div className="sparkles"><Sparkles size="1em" aria-hidden="true" /></div>
            </div>
            <h2><PartyPopper size="1em" aria-hidden="true" /> Başarı Açıldı!</h2>
            <h3>{newlyUnlocked.title}</h3>
            <p>{newlyUnlocked.description}</p>
            <button className="btn-primary" onClick={() => setShowUnlockModal(false)}>
              Harika!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;

