import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { NutritionSummaryDto } from '../types/nutrition';
import { WorkoutProgramDto } from '../types/workout';
import nutritionService from '../services/nutritionService';
import workoutService from '../services/workoutService';
import './Dashboard.css';
import { MacroProgress } from '../components/MacroProgress';
import { SupplementChecklist } from '../components/SupplementChecklist';
import { ArrowRight, Beef, BicepsFlexed, Dumbbell, Flame, Nut, Pill, Salad, Wheat } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummaryDto | null>(null);
  const [recentPrograms, setRecentPrograms] = useState<WorkoutProgramDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, programs] = await Promise.all([
          nutritionService.getDailySummary(),
          workoutService.getPrograms(),
        ]);
        setNutritionSummary(summary);
        setRecentPrograms(programs.slice(0, 3));
      } catch (error) {
        console.error('Dashboard veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDayName = (dayOfWeek: number) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayOfWeek];
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Hero Section */}
        <section className="dashboard-hero animate-slideUp">
          <div className="hero-content">
            <h1>
              {t('Merhaba')}, <span className="text-accent">{user?.name}</span>! <BicepsFlexed size="1em" aria-hidden="true" />
            </h1>
            <p>{t("Bugünkü hedeflerine ulaşmak için hazır mısın?")}</p>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-icon"><Flame size="1em" aria-hidden="true" /></span>
              <div className="stat-info">
                <span className="stat-value">{nutritionSummary?.totalCalories || 0}</span>
                <span className="stat-label">{t("Kalori")}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><Beef size="1em" aria-hidden="true" /></span>
              <div className="stat-info">
                <span className="stat-value">{nutritionSummary?.totalProtein?.toFixed(0) || 0}g</span>
                <span className="stat-label">{t("Protein")}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><Wheat size="1em" aria-hidden="true" /></span>
              <div className="stat-info">
                <span className="stat-value">{nutritionSummary?.totalCarbohydrates?.toFixed(0) || 0}g</span>
                <span className="stat-label">{t("Karbonhidrat")}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><Nut size="1em" aria-hidden="true" /></span>
              <div className="stat-info">
                <span className="stat-value">{nutritionSummary?.totalFat?.toFixed(0) || 0}g</span>
                <span className="stat-label">{t("Yağ")}</span>
              </div>
            </div>
          </div>
          <MacroProgress summary={nutritionSummary} />
        </section>

        <SupplementChecklist compact />

        {/* Quick Actions */}
        <section className="quick-actions animate-slideUp" style={{ animationDelay: '100ms' }}>
          <h2>{t("Hızlı İşlemler")}</h2>
          <div className="action-grid">
            <Link to="/workouts" className="action-card">
              <span className="action-icon"><Dumbbell size="1em" aria-hidden="true" /></span>
              <h3>{t("Yeni Antrenman")}</h3>
              <p>{t("Antrenman programı oluştur")}</p>
            </Link>
            <Link to="/nutrition" className="action-card">
              <span className="action-icon"><Salad size="1em" aria-hidden="true" /></span>
              <h3>{t("Öğün Ekle")}</h3>
              <p>{t("Günlük beslenme kaydı")}</p>
            </Link>
            <Link to="/supplements" className="action-card">
              <span className="action-icon"><Pill size="1em" aria-hidden="true" /></span>
              <h3>{t("Takviye Takibi")}</h3>
              <p>{t("Supplement kayıtları")}</p>
            </Link>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="recent-section animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="section-header">
            <h2>{t("Antrenman Programların")}</h2>
            <Link to="/workouts" className="see-all">{t("Tümünü Gör")} <ArrowRight size="1em" aria-hidden="true" /></Link>
          </div>
          
          {recentPrograms.length > 0 ? (
            <div className="program-grid">
              {recentPrograms.map((program) => (
                <div key={program.id} className="program-card card">
                  <h3>{program.name}</h3>
                  <p className="text-muted">{program.description || 'Açıklama yok'}</p>
                  <div className="program-days">
                    {program.workoutDays.slice(0, 3).map((day) => (
                      <span key={day.id} className="day-badge">
                        {getDayName(day.dayOfWeek)}
                      </span>
                    ))}
                    {program.workoutDays.length > 3 && (
                      <span className="day-badge more">+{program.workoutDays.length - 3}</span>
                    )}
                  </div>
                  <div className="program-meta">
                    <span>{program.workoutDays.length} gün</span>
                    <span>•</span>
                    <span>{program.workoutDays.reduce((acc, d) => acc + d.exercises.length, 0)} egzersiz</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state card">
              <span className="empty-icon"><Dumbbell size="1em" aria-hidden="true" /></span>
              <h3>{t("Henüz antrenman programın yok")}</h3>
              <p>{t("İlk programını oluşturarak başla!")}</p>
              <Link to="/workouts" className="btn-primary">
                {t("Program Oluştur")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

