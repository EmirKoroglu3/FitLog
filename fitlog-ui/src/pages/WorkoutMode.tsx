import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkoutProgramDto, WorkoutDayDto } from '../types/workout';
import workoutService from '../services/workoutService';
import './WorkoutMode.css';

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number[];
  notes: string;
}

export function WorkoutMode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const programId = searchParams.get('programId');
  const dayId = searchParams.get('dayId');
  
  // Program seçim state'leri
  const [allPrograms, setAllPrograms] = useState<WorkoutProgramDto[]>([]);
  const [showProgramSelect, setShowProgramSelect] = useState(!programId);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [program, setProgram] = useState<WorkoutProgramDto | null>(null);
  const [currentDay, setCurrentDay] = useState<WorkoutDayDto | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [remainingRest, setRemainingRest] = useState(90);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  useEffect(() => {
    fetchAllPrograms();
    // Audio element oluştur
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0HOnHc+Y1uDA0se/D/o3YNFR9P6P+5jBEOGULZ8sSdGREWNsTnxqciGQ8wpNbMq0QhExqXwtDAdD8WHot/2/+FRCUbZnfi/55OJRpCUNz9p1omHCk+0f61eCYaMzC++reKKR4qKKjqw50qISkfoNzGqjQnJxWN0M+zQiwlDYHM37NFLSQHdsjmvVYtIwVrxea8XT0lCWPC5rtiRSoKXLzluWtMKgtXteC3dVQpDF6y3rB+WiQOYa7dq4ZeHxBeotuojGIbE1ie1qWQZhgWUJjRo5ZpFBhKksyhnWwRGkWLx52hcQ4cQIfCm6V2DBw9g76YqXoKHzl+uZasfAggNHqzk69/ByM4ebKPsIEFJjh4r4uwgwMoPnmsjbGDBys+eKiLs4QCLT93pYu0hQEvPXaijLWGADA8daCKtoYAMTt0nYm3hwAxOnOaibiHADI5cpWIuIgAMjlyko+3hwAzOXGQjrWGADQ4cI6NtYUANDdvjIy0hAA1NW6KirODADY0bYmJsoIANjNsiImxgQA3M2uGh7CAADY0aoaGr38ANjNphYWufgA3MmmDg6x9ADcyZ4KCq3wAODFmgYGqewA4MGV/f6l6ADkwZH5+qHkAOS9jfX2neAA6L2J8fKZ3ADovYXt7pXYAOy5gem1/dAAA');
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (programId && allPrograms.length > 0) {
      fetchProgram();
      setShowProgramSelect(false);
    }
  }, [programId, allPrograms]);

  const fetchAllPrograms = async () => {
    try {
      setLoading(true);
      const programs = await workoutService.getPrograms();
      setAllPrograms(programs);
      
      // Bugünün gününe göre öneri
      const todayDayOfWeek = new Date().getDay();
      for (const prog of programs) {
        const todayDay = prog.workoutDays.find(d => d.dayOfWeek === todayDayOfWeek && d.exercises.length > 0);
        if (todayDay) {
          setSelectedProgramId(prog.id);
          setSelectedDayId(todayDay.id);
          break;
        }
      }
    } catch (err) {
      console.error('Programlar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSelectedWorkout = () => {
    if (selectedProgramId && selectedDayId) {
      setSearchParams({ programId: selectedProgramId, dayId: selectedDayId });
    }
  };

  useEffect(() => {
    if (currentDay && progress.length === 0) {
      const initialProgress = currentDay.exercises.map(ex => ({
        exerciseId: ex.id,
        completedSets: [],
        notes: ''
      }));
      setProgress(initialProgress);
    }
  }, [currentDay]);

  const fetchProgram = async () => {
    try {
      const foundProgram = allPrograms.find(p => p.id === programId);
      
      if (foundProgram) {
        setProgram(foundProgram);
        
        const day = dayId 
          ? foundProgram.workoutDays.find(d => d.id === dayId)
          : foundProgram.workoutDays.find(d => d.exercises.length > 0) || foundProgram.workoutDays[0];
          
        if (day && day.exercises.length > 0) {
          setCurrentDay(day);
          setShowProgramSelect(false);
          startWorkout();
        } else {
          // Egzersiz yoksa seçim ekranına dön
          setShowProgramSelect(true);
        }
      }
    } catch (err) {
      console.error('Program yüklenirken hata:', err);
    }
  };

  const startWorkout = () => {
    workoutTimerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRemainingRest(restTime);
    
    timerRef.current = setInterval(() => {
      setRemainingRest(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsResting(false);
          // Ses çal
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsResting(false);
    setRemainingRest(0);
  };

  const completeSet = () => {
    const currentExercise = currentDay?.exercises[currentExerciseIndex];
    if (!currentExercise) return;
    
    // Seti tamamlandı olarak işaretle
    setProgress(prev => {
      const updated = [...prev];
      const exerciseProgress = updated.find(p => p.exerciseId === currentExercise.id);
      if (exerciseProgress) {
        exerciseProgress.completedSets.push(currentSetIndex + 1);
      }
      return updated;
    });

    // Sonraki set veya egzersiz
    if (currentSetIndex + 1 < currentExercise.setCount) {
      setCurrentSetIndex(prev => prev + 1);
      startRestTimer();
    } else {
      // Egzersiz bitti, sonrakine geç
      if (currentExerciseIndex + 1 < (currentDay?.exercises.length || 0)) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        startRestTimer();
      } else {
        // Tüm antrenman bitti
        finishWorkout();
      }
    }
  };

  const finishWorkout = () => {
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    setShowCompleteModal(true);
    
    // LocalStorage'a kaydet
    const today = new Date().toISOString().split('T')[0];
    const savedLogs = localStorage.getItem('workoutLogs');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    
    const newLog = {
      date: today,
      programName: program?.name || '',
      dayName: currentDay?.name || '',
      exerciseCount: currentDay?.exercises.length || 0,
      completed: true,
      duration: elapsedTime
    };
    
    logs.push(newLog);
    localStorage.setItem('workoutLogs', JSON.stringify(logs));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      // Resume
      workoutTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Pause
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    }
  };

  const getTotalSets = () => {
    return currentDay?.exercises.reduce((sum, ex) => sum + ex.setCount, 0) || 0;
  };

  const getCompletedSets = () => {
    return progress.reduce((sum, p) => sum + p.completedSets.length, 0);
  };

  const progressPercent = getTotalSets() > 0 ? (getCompletedSets() / getTotalSets()) * 100 : 0;

  // Yükleniyor
  if (loading) {
    return (
      <div className="workout-mode-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳ Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // Program seçim ekranı
  if (showProgramSelect || !program || !currentDay) {
    const selectedProgram = allPrograms.find(p => p.id === selectedProgramId);
    const todayDayOfWeek = new Date().getDay();
    
    return (
      <div className="workout-mode-page">
        <div className="program-select-container">
          <div className="select-header">
            <h1>⏱️ Antrenman Başlat</h1>
            <p>Bugün hangi antrenmanı yapacaksın?</p>
          </div>

          {allPrograms.length === 0 ? (
            <div className="no-programs-message">
              <span className="empty-icon">📋</span>
              <h3>Henüz program oluşturmadın</h3>
              <p>Antrenman başlatmak için önce bir program oluştur</p>
              <button className="btn-primary" onClick={() => navigate('/workouts')}>
                ➕ Program Oluştur
              </button>
            </div>
          ) : (
            <>
              {/* Program Seçimi */}
              <div className="program-cards">
                {allPrograms.map(prog => {
                  const todayDay = prog.workoutDays.find(d => d.dayOfWeek === todayDayOfWeek);
                  const hasWorkoutToday = todayDay && todayDay.exercises.length > 0;
                  
                  return (
                    <div 
                      key={prog.id}
                      className={`program-card ${selectedProgramId === prog.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedProgramId(prog.id);
                        // Bugünün gününü veya ilk egzersizli günü seç
                        const dayToSelect = prog.workoutDays.find(d => d.dayOfWeek === todayDayOfWeek && d.exercises.length > 0)
                          || prog.workoutDays.find(d => d.exercises.length > 0);
                        setSelectedDayId(dayToSelect?.id || null);
                      }}
                    >
                      <div className="program-card-header">
                        <h3>{prog.name}</h3>
                        {hasWorkoutToday && <span className="today-badge">📍 Bugün</span>}
                      </div>
                      <p className="program-desc">{prog.description || 'Antrenman programı'}</p>
                      <div className="program-days-preview">
                        {prog.workoutDays.filter(d => d.exercises.length > 0).length} gün / hafta
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gün Seçimi */}
              {selectedProgram && (
                <div className="day-selection">
                  <h3>📅 Gün Seç</h3>
                  <div className="day-cards">
                    {selectedProgram.workoutDays
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map(day => {
                        const isOffDay = day.exercises.length === 0;
                        const isToday = day.dayOfWeek === todayDayOfWeek;
                        
                        return (
                          <div 
                            key={day.id}
                            className={`day-card ${selectedDayId === day.id ? 'selected' : ''} ${isOffDay ? 'off-day' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => !isOffDay && setSelectedDayId(day.id)}
                          >
                            <span className="day-name">{dayNames[day.dayOfWeek]}</span>
                            {isOffDay ? (
                              <span className="off-label">😴 Off Day</span>
                            ) : (
                              <>
                                <span className="workout-name">{day.name || 'Antrenman'}</span>
                                <span className="exercise-count">{day.exercises.length} egzersiz</span>
                              </>
                            )}
                            {isToday && !isOffDay && <span className="today-indicator">Bugün</span>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Başlat Butonu */}
              <div className="start-actions">
                <button 
                  className="btn-start-workout"
                  disabled={!selectedProgramId || !selectedDayId}
                  onClick={startSelectedWorkout}
                >
                  🚀 Antrenmanı Başlat
                </button>
                <button className="btn-secondary" onClick={() => navigate('/workouts')}>
                  ← Geri Dön
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentExercise = currentDay.exercises[currentExerciseIndex];

  return (
    <div className="workout-mode-page">
      {/* Header */}
      <div className="workout-mode-header">
        <button className="btn-back" onClick={() => navigate('/workouts')}>
          ← Çıkış
        </button>
        <div className="workout-timer">
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(elapsedTime)}</span>
        </div>
        <button className="btn-pause" onClick={togglePause}>
          {isPaused ? '▶️ Devam' : '⏸️ Duraklat'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="progress-text">{getCompletedSets()}/{getTotalSets()} set tamamlandı</span>
      </div>

      {/* Main Content */}
      <div className="workout-mode-content">
        {isResting ? (
          /* Rest Timer */
          <div className="rest-screen">
            <h2>😮‍💨 Dinlenme</h2>
            <div className="rest-timer-circle">
              <svg viewBox="0 0 200 200">
                <circle 
                  cx="100" 
                  cy="100" 
                  r="90" 
                  className="timer-bg"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="90" 
                  className="timer-progress"
                  style={{
                    strokeDasharray: 565.48,
                    strokeDashoffset: 565.48 * (1 - remainingRest / restTime)
                  }}
                />
              </svg>
              <span className="rest-time">{remainingRest}s</span>
            </div>
            <p className="next-exercise">
              Sıradaki: <strong>{currentExercise?.name}</strong>
              <span>Set {currentSetIndex + 1}/{currentExercise?.setCount}</span>
            </p>
            <button className="btn-skip" onClick={skipRest}>
              Atla →
            </button>
            <div className="rest-time-selector">
              {[30, 60, 90, 120, 180].map(time => (
                <button 
                  key={time}
                  className={`time-option ${restTime === time ? 'active' : ''}`}
                  onClick={() => setRestTime(time)}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Exercise Screen */
          <div className="exercise-screen">
            <div className="exercise-number">
              Egzersiz {currentExerciseIndex + 1}/{currentDay.exercises.length}
            </div>
            
            <h1 className="exercise-name">{currentExercise?.name}</h1>
            
            <div className="exercise-details">
              <div className="detail-badge">
                <span className="detail-value">{currentExercise?.setCount}</span>
                <span className="detail-label">Set</span>
              </div>
              <div className="detail-badge">
                <span className="detail-value">{currentExercise?.reps}</span>
                <span className="detail-label">Tekrar</span>
              </div>
              {currentExercise?.weight && currentExercise.weight > 0 && (
                <div className="detail-badge weight">
                  <span className="detail-value">{currentExercise.weight}</span>
                  <span className="detail-label">kg</span>
                </div>
              )}
            </div>

            <div className="current-set">
              <span className="set-label">Şu Anki Set</span>
              <span className="set-number">{currentSetIndex + 1} / {currentExercise?.setCount}</span>
            </div>

            <div className="set-indicators">
              {Array.from({ length: currentExercise?.setCount || 0 }).map((_, i) => (
                <div 
                  key={i}
                  className={`set-dot ${i < currentSetIndex ? 'completed' : i === currentSetIndex ? 'current' : ''}`}
                />
              ))}
            </div>

            <button className="btn-complete-set" onClick={completeSet}>
              ✓ Seti Tamamla
            </button>

            {currentExercise?.notes && (
              <div className="exercise-notes">
                <span className="notes-icon">📝</span>
                {currentExercise.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise List Sidebar */}
      <div className="exercise-sidebar">
        <h3>🏋️ Egzersizler</h3>
        <div className="exercise-list">
          {currentDay.exercises.map((ex, idx) => {
            const exProgress = progress.find(p => p.exerciseId === ex.id);
            const isComplete = exProgress && exProgress.completedSets.length >= ex.setCount;
            const isCurrent = idx === currentExerciseIndex;
            
            return (
              <div 
                key={ex.id}
                className={`exercise-list-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <span className="item-status">
                  {isComplete ? '✅' : isCurrent ? '🔵' : '⚪'}
                </span>
                <span className="item-name">{ex.name}</span>
                <span className="item-sets">{exProgress?.completedSets.length || 0}/{ex.setCount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="complete-modal">
            <div className="confetti">🎉</div>
            <h2>Tebrikler! 💪</h2>
            <p>Antrenmanını başarıyla tamamladın!</p>
            
            <div className="workout-summary">
              <div className="summary-item">
                <span className="summary-icon">⏱️</span>
                <span className="summary-value">{formatTime(elapsedTime)}</span>
                <span className="summary-label">Süre</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon">🔄</span>
                <span className="summary-value">{getTotalSets()}</span>
                <span className="summary-label">Set</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon">🏋️</span>
                <span className="summary-value">{currentDay.exercises.length}</span>
                <span className="summary-label">Egzersiz</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => navigate('/calendar')}>
                📅 Takvime Git
              </button>
              <button className="btn-secondary" onClick={() => navigate('/workouts')}>
                Antrenmanlara Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutMode;

