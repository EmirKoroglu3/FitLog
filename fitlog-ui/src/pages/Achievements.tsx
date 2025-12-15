import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import './Achievements.css';

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

interface WorkoutLog {
  date: string;
  completed: boolean;
}

export function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  
  // Kullanıcı bazlı localStorage key
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;

  const achievementDefinitions: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedDate'>[] = [
    // Workout Achievements
    { id: 'first_workout', title: 'İlk Adım', description: 'İlk antrenmanını tamamla', icon: '🎉', category: 'workout', requirement: 1, rarity: 'common' },
    { id: 'workout_10', title: 'Başlangıç', description: '10 antrenman tamamla', icon: '💪', category: 'workout', requirement: 10, rarity: 'common' },
    { id: 'workout_25', title: 'Kararlı', description: '25 antrenman tamamla', icon: '🔥', category: 'workout', requirement: 25, rarity: 'rare' },
    { id: 'workout_50', title: 'Adanmış', description: '50 antrenman tamamla', icon: '⚡', category: 'workout', requirement: 50, rarity: 'rare' },
    { id: 'workout_100', title: 'Makine', description: '100 antrenman tamamla', icon: '🤖', category: 'workout', requirement: 100, rarity: 'epic' },
    { id: 'workout_250', title: 'Efsane', description: '250 antrenman tamamla', icon: '👑', category: 'workout', requirement: 250, rarity: 'legendary' },
    
    // Streak Achievements
    { id: 'streak_3', title: 'Üç Gün', description: '3 gün üst üste antrenman yap', icon: '🔗', category: 'streak', requirement: 3, rarity: 'common' },
    { id: 'streak_7', title: 'Bir Hafta', description: '7 gün üst üste antrenman yap', icon: '📅', category: 'streak', requirement: 7, rarity: 'common' },
    { id: 'streak_14', title: 'İki Hafta', description: '14 gün üst üste antrenman yap', icon: '🌟', category: 'streak', requirement: 14, rarity: 'rare' },
    { id: 'streak_30', title: 'Bir Ay', description: '30 gün üst üste antrenman yap', icon: '🏆', category: 'streak', requirement: 30, rarity: 'epic' },
    { id: 'streak_100', title: 'Kesintisiz', description: '100 gün üst üste antrenman yap', icon: '💎', category: 'streak', requirement: 100, rarity: 'legendary' },
    
    // Consistency Achievements
    { id: 'week_complete', title: 'Tam Hafta', description: 'Bir haftada tüm günleri tamamla', icon: '✅', category: 'consistency', requirement: 7, rarity: 'rare' },
    { id: 'month_active', title: 'Aktif Ay', description: 'Bir ayda 20+ antrenman yap', icon: '📊', category: 'consistency', requirement: 20, rarity: 'rare' },
    { id: 'early_bird', title: 'Erken Kuş', description: 'Sabah 7\'den önce antrenman yap', icon: '🌅', category: 'consistency', requirement: 1, rarity: 'common' },
    { id: 'night_owl', title: 'Gece Kuşu', description: 'Gece 22\'den sonra antrenman yap', icon: '🌙', category: 'consistency', requirement: 1, rarity: 'common' },
    
    // Strength Achievements
    { id: 'first_pr', title: 'İlk PR', description: 'İlk kişisel rekorunu kır', icon: '📈', category: 'strength', requirement: 1, rarity: 'common' },
    { id: 'pr_5', title: 'Rekor Avcısı', description: '5 kişisel rekor kır', icon: '🎯', category: 'strength', requirement: 5, rarity: 'rare' },
    { id: 'bench_100', title: 'Bench Press 100kg', description: 'Bench Press\'te 100kg kaldır', icon: '🏋️', category: 'strength', requirement: 100, rarity: 'epic' },
    { id: 'squat_140', title: 'Squat 140kg', description: 'Squat\'ta 140kg kaldır', icon: '🦵', category: 'strength', requirement: 140, rarity: 'epic' },
    { id: 'deadlift_180', title: 'Deadlift 180kg', description: 'Deadlift\'te 180kg kaldır', icon: '💪', category: 'strength', requirement: 180, rarity: 'legendary' },
    
    // Nutrition Achievements
    { id: 'water_goal', title: 'Su Uzmanı', description: '7 gün üst üste su hedefini tamamla', icon: '💧', category: 'nutrition', requirement: 7, rarity: 'common' },
    { id: 'nutrition_log_7', title: 'Özenli', description: '7 gün üst üste yemek kaydı tut', icon: '📝', category: 'nutrition', requirement: 7, rarity: 'common' },
    { id: 'protein_goal', title: 'Protein Kralı', description: '7 gün üst üste protein hedefini tamamla', icon: '🥩', category: 'nutrition', requirement: 7, rarity: 'rare' },
    
    // Special Achievements
    { id: 'profile_complete', title: 'Profil Tamamlandı', description: 'Profilini tamamen doldur', icon: '👤', category: 'special', requirement: 1, rarity: 'common' },
    { id: 'first_program', title: 'Planlamacı', description: 'İlk antrenman programını oluştur', icon: '📋', category: 'special', requirement: 1, rarity: 'common' },
    { id: 'body_measurement', title: 'Takipçi', description: 'İlk vücut ölçümünü kaydet', icon: '📏', category: 'special', requirement: 1, rarity: 'common' },
  ];

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    all: { label: 'Tümü', icon: '🏅' },
    workout: { label: 'Antrenman', icon: '🏋️' },
    streak: { label: 'Streak', icon: '🔥' },
    consistency: { label: 'Düzenlilik', icon: '📅' },
    strength: { label: 'Güç', icon: '💪' },
    nutrition: { label: 'Beslenme', icon: '🍎' },
    special: { label: 'Özel', icon: '⭐' },
  };

  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };

  useEffect(() => {
    if (user) {
      calculateAchievements();
    }
  }, [user]);

  const calculateAchievements = () => {
    // LocalStorage'dan verileri al - kullanıcı bazlı
    const workoutLogs: WorkoutLog[] = JSON.parse(localStorage.getItem(getStorageKey('workoutLogs')) || '[]');
    const waterLogs = JSON.parse(localStorage.getItem(getStorageKey('waterLogs')) || '[]');
    const bodyMeasurements = JSON.parse(localStorage.getItem(getStorageKey('bodyMeasurements')) || '[]');
    const oneRMRecords = JSON.parse(localStorage.getItem(getStorageKey('oneRMRecords')) || '[]');
    const savedAchievements = JSON.parse(localStorage.getItem(getStorageKey('achievements')) || '{}');
    
    const totalWorkouts = workoutLogs.filter((l: WorkoutLog) => l.completed).length;
    
    // Streak hesapla
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasWorkout = workoutLogs.some((l: WorkoutLog) => l.date === dateStr && l.completed);
      if (hasWorkout) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const calculatedAchievements = achievementDefinitions.map(def => {
      let currentProgress = 0;
      let unlocked = savedAchievements[def.id]?.unlocked || false;
      let unlockedDate = savedAchievements[def.id]?.unlockedDate;

      // Her başarı için progress hesapla
      switch (def.id) {
        case 'first_workout':
        case 'workout_10':
        case 'workout_25':
        case 'workout_50':
        case 'workout_100':
        case 'workout_250':
          currentProgress = totalWorkouts;
          break;
        case 'streak_3':
        case 'streak_7':
        case 'streak_14':
        case 'streak_30':
        case 'streak_100':
          currentProgress = currentStreak;
          break;
        case 'water_goal':
          currentProgress = waterLogs.filter((l: { glasses: number }) => l.glasses >= 8).length;
          break;
        case 'first_pr':
        case 'pr_5':
          currentProgress = oneRMRecords.length;
          break;
        case 'body_measurement':
          currentProgress = bodyMeasurements.length > 0 ? 1 : 0;
          break;
        case 'profile_complete':
          // Basit kontrol
          currentProgress = 1;
          break;
        case 'first_program':
          // Program sayısını kontrol edebiliriz
          currentProgress = 1;
          break;
        default:
          currentProgress = 0;
      }

      // Yeni unlock kontrolü
      if (!unlocked && currentProgress >= def.requirement) {
        unlocked = true;
        unlockedDate = new Date().toISOString();
        
        // Yeni unlock'ı göster
        if (!savedAchievements[def.id]?.unlocked) {
          setNewlyUnlocked({ ...def, currentProgress, unlocked, unlockedDate } as Achievement);
          setShowUnlockModal(true);
        }
      }

      return {
        ...def,
        currentProgress,
        unlocked,
        unlockedDate,
      };
    });

    setAchievements(calculatedAchievements);
    
    // Kaydet
    const achievementsToSave = calculatedAchievements.reduce((acc, a) => {
      acc[a.id] = { unlocked: a.unlocked, unlockedDate: a.unlockedDate };
      return acc;
    }, {} as Record<string, { unlocked: boolean; unlockedDate?: string }>);
    localStorage.setItem(getStorageKey('achievements'), JSON.stringify(achievementsToSave));
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
          <h1>🏆 Başarılar</h1>
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
              <span className="filter-icon">{icon}</span>
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
                {achievement.unlocked ? achievement.icon : '🔒'}
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
                    ✅ {new Date(achievement.unlockedDate).toLocaleDateString('tr-TR')}
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
            className="unlock-modal"
            onClick={e => e.stopPropagation()}
            style={{ '--rarity-color': rarityColors[newlyUnlocked.rarity] } as React.CSSProperties}
          >
            <div className="unlock-animation">
              <div className="unlock-icon">{newlyUnlocked.icon}</div>
              <div className="sparkles">✨</div>
            </div>
            <h2>🎉 Başarı Açıldı!</h2>
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

