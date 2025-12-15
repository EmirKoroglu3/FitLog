import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutProgramDto, WorkoutDayDto } from '../types/workout';
import workoutService from '../services/workoutService';
import './Calendar.css';

interface WorkoutLog {
  date: string;
  programName: string;
  dayName: string;
  exerciseCount: number;
  completed: boolean;
  duration?: number;
}

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [programs, setPrograms] = useState<WorkoutProgramDto[]>([]);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgramDto | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const dayNamesFull = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStreak();
  }, [workoutLogs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getPrograms();
      setPrograms(data);
      
      // İlk programı aktif program olarak seç (veya localStorage'dan oku)
      const savedActiveProgram = localStorage.getItem('activeProgramId');
      if (savedActiveProgram && data.find(p => p.id === savedActiveProgram)) {
        setActiveProgram(data.find(p => p.id === savedActiveProgram) || null);
      } else if (data.length > 0) {
        setActiveProgram(data[0]);
        localStorage.setItem('activeProgramId', data[0].id);
      }
      
      // Workout log'ları localStorage'dan al (gerçek projede API'den gelir)
      const savedLogs = localStorage.getItem('workoutLogs');
      if (savedLogs) {
        setWorkoutLogs(JSON.parse(savedLogs));
      }
    } catch (err) {
      console.error('Veri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectActiveProgram = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setActiveProgram(program);
      localStorage.setItem('activeProgramId', programId);
    }
  };

  // Belirli bir tarih için planlanan antrenmanı getir
  const getPlannedWorkoutForDate = (dateStr: string): WorkoutDayDto | null => {
    if (!activeProgram) return null;
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    const plannedDay = activeProgram.workoutDays.find(d => d.dayOfWeek === dayOfWeek);
    return plannedDay || null;
  };

  const isOffDay = (dateStr: string): boolean => {
    const plannedDay = getPlannedWorkoutForDate(dateStr);
    return plannedDay ? plannedDay.exercises.length === 0 : true;
  };

  const calculateStreak = () => {
    const today = new Date();
    let currentStreak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasWorkout = workoutLogs.some(log => log.date === dateStr && log.completed);
      
      if (hasWorkout) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getWorkoutForDate = (dateStr: string) => {
    return workoutLogs.find(log => log.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const logWorkout = (programId: string, dayId: string) => {
    if (!selectedDate) return;
    
    const program = programs.find(p => p.id === programId);
    const day = program?.workoutDays.find(d => d.id === dayId);
    
    if (!program || !day) return;
    
    const newLog: WorkoutLog = {
      date: selectedDate,
      programName: program.name,
      dayName: day.name || dayNames[day.dayOfWeek],
      exerciseCount: day.exercises.length,
      completed: true
    };
    
    const updatedLogs = [...workoutLogs.filter(l => l.date !== selectedDate), newLog];
    setWorkoutLogs(updatedLogs);
    localStorage.setItem('workoutLogs', JSON.stringify(updatedLogs));
    setSelectedDate(null);
  };

  const removeWorkout = (dateStr: string) => {
    const updatedLogs = workoutLogs.filter(l => l.date !== dateStr);
    setWorkoutLogs(updatedLogs);
    localStorage.setItem('workoutLogs', JSON.stringify(updatedLogs));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const calendarDays = [];
  
  // Empty cells before first day
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getDateString(day);
    const completedWorkout = getWorkoutForDate(dateStr);
    const plannedWorkout = getPlannedWorkoutForDate(dateStr);
    const offDay = isOffDay(dateStr);
    const today = isToday(day);
    const isPast = new Date(dateStr) < new Date(new Date().toDateString());
    
    calendarDays.push(
      <div 
        key={day}
        className={`calendar-day 
          ${completedWorkout ? 'completed' : ''} 
          ${!completedWorkout && plannedWorkout && plannedWorkout.exercises.length > 0 ? 'planned' : ''} 
          ${offDay && !completedWorkout ? 'off-day' : ''} 
          ${today ? 'today' : ''} 
          ${selectedDate === dateStr ? 'selected' : ''}
          ${isPast && !completedWorkout && !offDay ? 'missed' : ''}`}
        onClick={() => setSelectedDate(dateStr)}
      >
        <span className="day-number">{day}</span>
        
        {completedWorkout ? (
          <div className="workout-indicator completed">
            <span className="workout-icon">✅</span>
            <span className="workout-name-mini">{completedWorkout.dayName}</span>
          </div>
        ) : plannedWorkout && plannedWorkout.exercises.length > 0 ? (
          <div className="workout-indicator planned">
            <span className="workout-icon">🏋️</span>
            <span className="workout-name-mini">{plannedWorkout.name || 'Antrenman'}</span>
          </div>
        ) : offDay ? (
          <div className="workout-indicator off">
            <span className="workout-icon">😴</span>
            <span className="workout-name-mini">Off</span>
          </div>
        ) : null}
      </div>
    );
  }

  // Bugünün planlanan antrenmanı (aktif programdan)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayPlannedWorkout = getPlannedWorkoutForDate(todayDateStr);
  const todayCompleted = getWorkoutForDate(todayDateStr);

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="loading-spinner">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="container">
        <div className="calendar-header">
          <h1>📅 Antrenman Takvimi</h1>
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
            <span className="streak-label">Gün Streak</span>
          </div>
        </div>

        <div className="calendar-layout">
          {/* Sol Panel - Takvim */}
          <div className="calendar-container card">
            {/* Program Seçici */}
            {programs.length > 1 && (
              <div className="program-selector">
                <label>Aktif Program:</label>
                <select 
                  value={activeProgram?.id || ''} 
                  onChange={(e) => selectActiveProgram(e.target.value)}
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="calendar-nav">
              <button onClick={() => navigateMonth(-1)}>←</button>
              <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={() => navigateMonth(1)}>→</button>
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-header-day">{day}</div>
              ))}
              {calendarDays}
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot completed-dot">✅</span>
                <span>Tamamlandı</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot planned-dot">🏋️</span>
                <span>Planlanan</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot off-dot">😴</span>
                <span>Off Day</span>
              </div>
            </div>
          </div>

          {/* Sağ Panel */}
          <div className="calendar-sidebar">
            {/* Bugünün Antrenmanı */}
            <div className="today-workout card">
              <h3>📍 Bugün - {dayNamesFull[new Date().getDay()]}</h3>
              
              {todayCompleted ? (
                <div className="today-completed">
                  <span className="completed-badge">✅ Tamamlandı!</span>
                  <div className="completed-details">
                    <span>{todayCompleted.dayName}</span>
                    {todayCompleted.duration && (
                      <span className="duration">{Math.floor(todayCompleted.duration / 60)} dk</span>
                    )}
                  </div>
                </div>
              ) : todayPlannedWorkout && todayPlannedWorkout.exercises.length > 0 ? (
                <div className="today-planned">
                  <div className="planned-info">
                    <span className="workout-type">{todayPlannedWorkout.name || 'Antrenman'}</span>
                    <span className="exercise-count">{todayPlannedWorkout.exercises.length} egzersiz</span>
                    <div className="exercise-preview">
                      {todayPlannedWorkout.exercises.slice(0, 3).map(ex => (
                        <span key={ex.id} className="exercise-tag">{ex.name}</span>
                      ))}
                      {todayPlannedWorkout.exercises.length > 3 && (
                        <span className="more-tag">+{todayPlannedWorkout.exercises.length - 3} daha</span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn-start-today"
                    onClick={() => navigate(`/workout-mode?programId=${activeProgram?.id}&dayId=${todayPlannedWorkout.id}`)}
                  >
                    🚀 Başlat
                  </button>
                </div>
              ) : (
                <div className="today-off">
                  <span className="off-icon">😴</span>
                  <span className="off-text">Bugün Off Day - Dinlen!</span>
                </div>
              )}
            </div>

            {/* Seçili Gün Detayı */}
            {selectedDate && (
              <div className="selected-day-detail card">
                <h3>
                  📆 {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'long'
                  })}
                </h3>
                
                {(() => {
                  const completedWorkout = getWorkoutForDate(selectedDate);
                  const plannedWorkout = getPlannedWorkoutForDate(selectedDate);
                  const isOff = isOffDay(selectedDate);
                  
                  if (completedWorkout) {
                    return (
                      <div className="logged-workout">
                        <div className="logged-info">
                          <span className="check-icon">✅</span>
                          <div>
                            <strong>{completedWorkout.programName}</strong>
                            <span>{completedWorkout.dayName}</span>
                            {completedWorkout.duration && (
                              <span className="workout-duration">⏱️ {Math.floor(completedWorkout.duration / 60)} dk</span>
                            )}
                          </div>
                        </div>
                        <button 
                          className="btn-secondary btn-small"
                          onClick={() => removeWorkout(selectedDate)}
                        >
                          🗑️ Kaldır
                        </button>
                      </div>
                    );
                  } else if (plannedWorkout && plannedWorkout.exercises.length > 0) {
                    return (
                      <div className="planned-workout-detail">
                        <div className="planned-header">
                          <span className="planned-icon">🏋️</span>
                          <div>
                            <strong>{plannedWorkout.name || 'Antrenman'}</strong>
                            <span>{plannedWorkout.exercises.length} egzersiz</span>
                          </div>
                        </div>
                        <div className="planned-exercises">
                          {plannedWorkout.exercises.map(ex => (
                            <div key={ex.id} className="planned-exercise">
                              <span className="ex-name">{ex.name}</span>
                              <span className="ex-details">{ex.setCount}x{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                        <div className="planned-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => navigate(`/workout-mode?programId=${activeProgram?.id}&dayId=${plannedWorkout.id}`)}
                          >
                            🚀 Antrenmanı Başlat
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              if (activeProgram) {
                                logWorkout(activeProgram.id, plannedWorkout.id);
                              }
                            }}
                          >
                            ✓ Manuel Tamamla
                          </button>
                        </div>
                      </div>
                    );
                  } else if (isOff) {
                    return (
                      <div className="off-day-detail">
                        <span className="off-icon">😴</span>
                        <p>Bu gün dinlenme günü</p>
                        <p className="off-tip">💡 Kasların büyümesi için dinlenme önemlidir!</p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="no-program-message">
                        <p>Bu gün için planlı antrenman yok</p>
                        <button 
                          className="btn-secondary"
                          onClick={() => navigate('/workouts')}
                        >
                          Program Oluştur
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* İstatistikler */}
            <div className="calendar-stats card">
              <h3>📊 Bu Ay</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">
                    {workoutLogs.filter(l => 
                      l.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
                    ).length}
                  </span>
                  <span className="stat-label">Antrenman</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{streak}</span>
                  <span className="stat-label">Streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;

