import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkoutProgramDto, WorkoutDayDto } from '../types/workout';
import workoutService from '../services/workoutService';
import { sessionsApi, type PersonalRecord, type SessionSet } from '../services/trackingService';
import { useSettings } from '../store/SettingsContext';
import { useAuth } from '../store/AuthContext';
import { isNetworkError, queueSession } from '../utils/offlineQueue';
import { kgToUnit, unitToKg, formatWeight, formatNumber } from '../utils/units';
import { WorkoutTools } from '../components/WorkoutTools';
import { CardioModal } from '../components/CardioModal';
import './WorkoutMode.css';
import { HeartPulse, ArrowLeft, ArrowRight, BedDouble, BicepsFlexed, CalendarDays, Check, Circle, CircleCheck, CircleDot, ClipboardList, Dumbbell, Flag, Hourglass, MapPin, NotebookPen, PartyPopper, Pause, Play, Plus, Repeat, Timer, Trophy, Weight, Wind } from 'lucide-react';
import { useConfirm } from '../components/ConfirmProvider';

/** Previous working sets per exercise name, newest session first. */
type LastPerformance = Record<string, SessionSet[]>;

interface SetInput {
  reps: string;
  weight: string; // in the user's unit
  rpe: string;
}

const BEEP =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0HOnHc+Y1uDA0se/D/o3YNFR9P6P+5jBEOGULZ8sSdGREWNsTnxqciGQ8wpNbMq0QhExqXwtDAdD8WHot/2/+FRCUbZnfi/55OJRpCUNz9p1omHCk+0f61eCYaMzC++reKKR4qKKjqw50qISkfoNzGqjQnJxWN0M+zQiwlDYHM37NFLSQHdsjmvVYtIwVrxea8XT0lCWPC5rtiRSoKXLzluWtMKgtXteC3dVQpDF6y3rB+WiQOYa7dq4ZeHxBeotuojGIbE1ie1qWQZhgWUJjRo5ZpFBhKksyhnWwRGkWLx52hcQ4cQIfCm6V2DBw9g76YqXoKHzl+uZasfAggNHqzk69/ByM4ebKPsIEFJjh4r4uwgwMoPnmsjbGDBys+eKiLs4QCLT93pYu0hQEvPXaijLWGADA8daCKtoYAMTt0nYm3hwAxOnOaibiHADI5cpWIuIgAMjlyko+3hwAzOXGQjrWGADQ4cI6NtYUANDdvjIy0hAA1NW6KirODADY0bYmJsoIANjNsiImxgQA3M2uGh7CAADY0aoaGr38ANjNphYWufgA3MmmDg6x9ADcyZ4KCq3wAODFmgYGqewA4MGV/f6l6ADkwZH5+qHkAOS9jfX2neAA6L2J8fKZ3ADovYXt7pXYAOy5gem1/dAAA';

export function WorkoutMode() {
  const { confirm } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const unit = settings.weightUnit;
  const programId = searchParams.get('programId');
  const dayId = searchParams.get('dayId');

  // Program selection
  const [allPrograms, setAllPrograms] = useState<WorkoutProgramDto[]>([]);
  const [showProgramSelect, setShowProgramSelect] = useState(!programId);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Active workout
  const [program, setProgram] = useState<WorkoutProgramDto | null>(null);
  const [currentDay, setCurrentDay] = useState<WorkoutDayDto | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loggedSets, setLoggedSets] = useState<SessionSet[]>([]);
  const [input, setInput] = useState<SetInput>({ reps: '', weight: '', rpe: '' });
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(settings.defaultRestSeconds);
  const [remainingRest, setRemainingRest] = useState(settings.defaultRestSeconds);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [lastPerformance, setLastPerformance] = useState<LastPerformance>({});
  const [records, setRecords] = useState<PersonalRecord[]>([]);

  // Finish
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [newPrs, setNewPrs] = useState<{ name: string; weightKg: number; reps: number }[]>([]);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const { user } = useAuth();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  useEffect(() => {
    fetchAllPrograms();
    audioRef.current = new Audio(BEEP);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setRestTime(settings.defaultRestSeconds);
  }, [settings.defaultRestSeconds]);

  useEffect(() => {
    if (programId && allPrograms.length > 0) {
      fetchProgram();
      setShowProgramSelect(false);
    }
  }, [programId, allPrograms]);

  // Warn before leaving with unsaved sets
  const inProgress = loggedSets.length > 0 && !savedSessionId;
  useEffect(() => {
    if (!inProgress) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [inProgress]);

  const fetchAllPrograms = async () => {
    try {
      setLoading(true);
      const [programs, recentSessions, prs] = await Promise.all([
        workoutService.getPrograms(),
        sessionsApi
          .list({ from: new Date(Date.now() - 120 * 86400000).toISOString(), includeSets: true })
          .catch(() => []),
        sessionsApi.personalRecords().catch(() => []),
      ]);
      setAllPrograms(programs);
      setRecords(prs);

      // Latest working sets for each exercise name
      const last: LastPerformance = {};
      for (const session of recentSessions) {
        const byName = new Map<string, SessionSet[]>();
        session.sets.filter((s) => !s.isWarmup).forEach((s) => {
          byName.set(s.exerciseName, [...(byName.get(s.exerciseName) ?? []), s]);
        });
        byName.forEach((sets, name) => {
          if (!last[name]) last[name] = sets.sort((a, b) => a.setNumber - b.setNumber);
        });
      }
      setLastPerformance(last);

      // Suggest today's day
      const todayDayOfWeek = new Date().getDay();
      for (const prog of programs) {
        const todayDay = prog.workoutDays.find((d) => d.dayOfWeek === todayDayOfWeek && d.exercises.length > 0);
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

  const fetchProgram = () => {
    const foundProgram = allPrograms.find((p) => p.id === programId);
    if (!foundProgram) return;
    setProgram(foundProgram);
    const day = dayId
      ? foundProgram.workoutDays.find((d) => d.id === dayId)
      : foundProgram.workoutDays.find((d) => d.exercises.length > 0) || foundProgram.workoutDays[0];

    if (day && day.exercises.length > 0) {
      setCurrentDay(day);
      setShowProgramSelect(false);
      startWorkout();
    } else {
      setShowProgramSelect(true);
    }
  };

  const startWorkout = () => {
    setStartedAt(new Date());
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    workoutTimerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
  };

  const currentExercise = currentDay?.exercises[currentExerciseIndex];
  const setsForCurrent = useMemo(
    () => loggedSets.filter((s) => s.exerciseOrder === currentExerciseIndex && !s.isWarmup),
    [loggedSets, currentExerciseIndex],
  );
  const currentSetNumber = setsForCurrent.length + 1;

  // Prefill inputs: same set from last time, else the plan
  useEffect(() => {
    if (!currentExercise) return;
    const prev = lastPerformance[currentExercise.name]?.[currentSetNumber - 1]
      ?? lastPerformance[currentExercise.name]?.slice(-1)[0];
    const weightKg = prev?.weightKg ?? currentExercise.weight ?? 0;
    setInput({
      reps: String(prev?.reps ?? currentExercise.reps),
      weight: weightKg > 0 ? String(kgToUnit(weightKg, unit)) : '',
      rpe: '',
    });
  }, [currentExercise?.id, currentSetNumber, lastPerformance, unit]);

  const playBeep = () => {
    if (settings.soundEffects) audioRef.current?.play().catch(() => {});
    if (settings.notifications && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FitLog', { body: 'Dinlenme bitti — sıradaki sete geç!' });
    }
    navigator.vibrate?.(200);
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRemainingRest(restTime);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingRest((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsResting(false);
          playBeep();
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
    if (!currentExercise || !currentDay) return;
    const reps = Math.max(0, Math.round(Number(input.reps) || 0));
    const weightKg = Math.max(0, unitToKg(Number(input.weight.replace(',', '.')) || 0, unit));
    const rpe = input.rpe ? Math.min(10, Math.max(1, Number(input.rpe))) : null;

    const newSet: SessionSet = {
      exerciseName: currentExercise.name,
      exerciseOrder: currentExerciseIndex,
      setNumber: currentSetNumber,
      reps,
      weightKg,
      rpe,
      isWarmup: false,
    };
    setLoggedSets((prev) => [...prev, newSet]);

    if (currentSetNumber < currentExercise.setCount) {
      startRestTimer();
    } else if (currentExerciseIndex + 1 < currentDay.exercises.length) {
      setCurrentExerciseIndex((prev) => prev + 1);
      startRestTimer();
    } else {
      finishWorkout([...loggedSets, newSet]);
    }
  };

  const addWarmupSets = (warmups: { reps: number; weightKg: number }[]) => {
    if (!currentExercise) return;
    setLoggedSets((prev) => [
      ...prev,
      ...warmups.map((w, i) => ({
        exerciseName: currentExercise.name,
        exerciseOrder: currentExerciseIndex,
        setNumber: i + 1,
        reps: w.reps,
        weightKg: w.weightKg,
        isWarmup: true,
      })),
    ]);
  };

  const finishWorkout = async (sets = loggedSets) => {
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsResting(false);
    setShowCompleteModal(true);

    // New personal records (heaviest working set beats the stored best)
    const best = new Map<string, SessionSet>();
    sets.filter((s) => !s.isWarmup && s.reps > 0 && s.weightKg > 0).forEach((s) => {
      const cur = best.get(s.exerciseName);
      if (!cur || s.weightKg > cur.weightKg || (s.weightKg === cur.weightKg && s.reps > cur.reps)) best.set(s.exerciseName, s);
    });
    setNewPrs(
      [...best.values()]
        .filter((s) => {
          const rec = records.find((r) => r.exerciseName === s.exerciseName);
          return !rec || s.weightKg > rec.bestWeightKg || (s.weightKg === rec.bestWeightKg && s.reps > rec.repsAtBest);
        })
        .map((s) => ({ name: s.exerciseName, weightKg: s.weightKg, reps: s.reps })),
    );

    await saveSession(sets);
  };

  const saveSession = async (sets: SessionSet[]) => {
    if (!currentDay || sets.length === 0) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      workoutProgramId: program?.id ?? null,
      workoutDayId: currentDay.id,
      name: currentDay.name || program?.name || 'Antrenman',
      type: 'strength' as const,
      startedAt: (startedAt ?? new Date(Date.now() - elapsedTime * 1000)).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: elapsedTime,
      notes: null,
      sets,
    };
    try {
      const session = await sessionsApi.create(payload);
      setSavedSessionId(session.id);
    } catch (err) {
      if (user && isNetworkError(err)) {
        // No connection: keep it on the device and send it later
        queueSession(user.id, payload);
        setSavedSessionId('offline');
        setSaveError(null);
        setOfflineSaved(true);
      } else {
        setSaveError('Antrenman kaydedilemedi. Tekrar dene.');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const mm = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return h > 0 ? `${h}:${mm}` : mm;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      workoutTimerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    } else if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
    }
  };

  const exitWorkout = async () => {
    if (inProgress && !(await confirm({ title: 'Antrenmandan çıkılsın mı?', message: 'Kaydedilmemiş setlerin var. Kaydetmek için önce "Bitir"e bas. Çıkarsan bu setler kaybolur.', confirmText: 'Kaydetmeden çık', cancelText: 'Antrenmana dön', danger: true }))) return;
    navigate('/workouts');
  };

  const workingSets = loggedSets.filter((s) => !s.isWarmup);
  const totalPlannedSets = currentDay?.exercises.reduce((sum, ex) => sum + ex.setCount, 0) || 0;
  const totalVolumeKg = workingSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const progressPercent = totalPlannedSets > 0 ? Math.min(100, (workingSets.length / totalPlannedSets) * 100) : 0;
  const lastForCurrent = currentExercise ? lastPerformance[currentExercise.name] : undefined;

  // Loading
  if (loading) {
    return (
      <div className="workout-mode-page">
        <div className="loading-container">
          <div className="loading-spinner"><Hourglass size="1em" aria-hidden="true" /> Yükleniyor...</div>
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
            <h1><Timer size="1em" aria-hidden="true" /> Antrenman Başlat</h1>
            <p>Bugün hangi antrenmanı yapacaksın?</p>
          </div>

          {allPrograms.length === 0 ? (
            <div className="no-programs-message">
              <span className="empty-icon"><ClipboardList size="1em" aria-hidden="true" /></span>
              <h3>Henüz program oluşturmadın</h3>
              <p>Antrenman başlatmak için önce bir program oluştur</p>
              <button className="btn-primary" onClick={() => navigate('/workouts')}>
                <Plus size="1em" aria-hidden="true" /> Program Oluştur
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
                        {hasWorkoutToday && <span className="today-badge"><MapPin size="1em" aria-hidden="true" /> Bugün</span>}
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
                  <h3><CalendarDays size="1em" aria-hidden="true" /> Gün Seç</h3>
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
                              <span className="off-label"><BedDouble size="1em" aria-hidden="true" /> Off Day</span>
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
                  <Play size="1em" aria-hidden="true" /> Antrenmanı Başlat
                </button>
                <button className="btn-secondary" onClick={() => setShowCardio(true)}>
                  <HeartPulse size="1em" aria-hidden="true" /> Kardiyo Kaydet
                </button>
                <button className="btn-secondary" onClick={() => navigate('/workouts')}>
                  <ArrowLeft size="1em" aria-hidden="true" /> Geri Dön
                </button>
              </div>
              {showCardio && <CardioModal onClose={() => setShowCardio(false)} onSaved={() => navigate('/calendar')} />}
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentExercise) return null;

  return (
    <div className="workout-mode-page">
      {/* Header */}
      <div className="workout-mode-header">
        <button className="btn-back" onClick={exitWorkout}>
          <ArrowLeft size="1em" aria-hidden="true" /> Çıkış
        </button>
        <div className="workout-timer">
          <span className="timer-icon"><Timer size="1em" aria-hidden="true" /></span>
          <span className="timer-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="header-actions">
          <button className="btn-pause" onClick={togglePause}>
            {isPaused
              ? <><Play size="1em" aria-hidden="true" /> Devam</>
              : <><Pause size="1em" aria-hidden="true" /> Duraklat</>}
          </button>
          <button className="btn-finish" onClick={() => finishWorkout()} disabled={workingSets.length === 0}>
            <Flag size="1em" aria-hidden="true" /> Bitir
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="progress-text">
          {workingSets.length}/{totalPlannedSets} set · {formatWeight(totalVolumeKg, unit)} hacim
        </span>
      </div>

      {/* Main Content */}
      <div className="workout-mode-content">
        {isResting ? (
          <div className="rest-screen">
            <h2><Wind size="1em" aria-hidden="true" /> Dinlenme</h2>
            <div className="rest-timer-circle">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="timer-bg" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  className="timer-progress"
                  style={{ strokeDasharray: 565.48, strokeDashoffset: 565.48 * (1 - remainingRest / restTime) }}
                />
              </svg>
              <span className="rest-time">{remainingRest}s</span>
            </div>
            <p className="next-exercise">
              Sıradaki: <strong>{currentExercise.name}</strong>
              <span>Set {currentSetNumber}/{currentExercise.setCount}</span>
            </p>
            <div className="rest-adjust">
              <button className="time-option" onClick={() => setRemainingRest((r) => Math.max(0, r - 15))}>−15s</button>
              <button className="btn-skip" onClick={skipRest}>
                Atla <ArrowRight size="1em" aria-hidden="true" />
              </button>
              <button className="time-option" onClick={() => setRemainingRest((r) => r + 15)}>+15s</button>
            </div>
            <div className="rest-time-selector" aria-label="Varsayılan dinlenme süresi">
              {[30, 60, 90, 120, 180].map((time) => (
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
          <div className="exercise-screen">
            <div className="exercise-number">
              Egzersiz {currentExerciseIndex + 1}/{currentDay.exercises.length}
            </div>

            <h1 className="exercise-name">{currentExercise.name}</h1>

            <div className="exercise-details">
              <div className="detail-badge">
                <span className="detail-value">{currentExercise.setCount}</span>
                <span className="detail-label">Set</span>
              </div>
              <div className="detail-badge">
                <span className="detail-value">{currentExercise.reps}</span>
                <span className="detail-label">Hedef tekrar</span>
              </div>
              {!!currentExercise.weight && currentExercise.weight > 0 && (
                <div className="detail-badge weight">
                  <span className="detail-value">{formatNumber(kgToUnit(currentExercise.weight, unit), 1)}</span>
                  <span className="detail-label">{unit}</span>
                </div>
              )}
            </div>

            {lastForCurrent && lastForCurrent.length > 0 && (
              <p className="last-time">
                Geçen sefer:{' '}
                {lastForCurrent.map((s) => `${formatNumber(kgToUnit(s.weightKg, unit), 1)}×${s.reps}`).join(' · ')}
              </p>
            )}

            <div className="current-set">
              <span className="set-label">Set</span>
              <span className="set-number">{Math.min(currentSetNumber, currentExercise.setCount)} / {currentExercise.setCount}</span>
            </div>

            <div className="set-inputs">
              <label>
                <span>Ağırlık ({unit})</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={unit === 'kg' ? 0.5 : 1}
                  value={input.weight}
                  onChange={(e) => setInput({ ...input, weight: e.target.value })}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Tekrar</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={input.reps}
                  onChange={(e) => setInput({ ...input, reps: e.target.value })}
                />
              </label>
              <label>
                <span>RPE <em>(ops.)</em></span>
                <select value={input.rpe} onChange={(e) => setInput({ ...input, rpe: e.target.value })}>
                  <option value="">—</option>
                  {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>

            <button className="btn-complete-set" onClick={completeSet}>
              <Check size="1em" aria-hidden="true" /> Seti Kaydet
            </button>

            {setsForCurrent.length > 0 && (
              <ol className="logged-sets">
                {setsForCurrent.map((s) => (
                  <li key={s.setNumber}>
                    <span>Set {s.setNumber}</span>
                    <strong>{formatNumber(kgToUnit(s.weightKg, unit), 1)} {unit} × {s.reps}</strong>
                    {s.rpe ? <em>RPE {s.rpe}</em> : <em />}
                  </li>
                ))}
              </ol>
            )}

            <WorkoutTools
              exerciseName={currentExercise.name}
              targetWeight={Number(input.weight.replace(',', '.')) || 0}
              unit={unit}
              onAddWarmups={addWarmupSets}
            />

            {currentExercise.notes && (
              <div className="exercise-notes">
                <span className="notes-icon"><NotebookPen size="1em" aria-hidden="true" /></span>
                {currentExercise.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise List Sidebar */}
      <div className="exercise-sidebar">
        <h3><Dumbbell size="1em" aria-hidden="true" /> Egzersizler</h3>
        <div className="exercise-list">
          {currentDay.exercises.map((ex, idx) => {
            const done = loggedSets.filter((s) => s.exerciseOrder === idx && !s.isWarmup).length;
            const isComplete = done >= ex.setCount;
            const isCurrent = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                type="button"
                className={`exercise-list-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => {
                  skipRest();
                  setCurrentExerciseIndex(idx);
                }}
              >
                <span className="item-status">
                  {isComplete
                    ? <CircleCheck size="1em" aria-hidden="true" />
                    : isCurrent
                      ? <CircleDot size="1em" aria-hidden="true" />
                      : <Circle size="1em" aria-hidden="true" />}
                </span>
                <span className="item-name">{ex.name}</span>
                <span className="item-sets">{done}/{ex.setCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="complete-modal">
            <div className="confetti"><PartyPopper size="1em" aria-hidden="true" /></div>
            <h2>Tebrikler! <BicepsFlexed size="1em" aria-hidden="true" /></h2>
            <p>
              {saving
                ? 'Antrenman kaydediliyor…'
                : offlineSaved
                  ? 'Bağlantı yok — antrenman cihazına kaydedildi, internet gelince otomatik gönderilecek.'
                  : savedSessionId
                  ? 'Antrenmanın kaydedildi.'
                  : saveError ?? 'Antrenmanını tamamladın!'}
            </p>

            <div className="workout-summary">
              <div className="summary-item">
                <span className="summary-icon"><Timer size="1em" aria-hidden="true" /></span>
                <span className="summary-value">{formatTime(elapsedTime)}</span>
                <span className="summary-label">Süre</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon"><Repeat size="1em" aria-hidden="true" /></span>
                <span className="summary-value">{workingSets.length}</span>
                <span className="summary-label">Set</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon"><Weight size="1em" aria-hidden="true" /></span>
                <span className="summary-value">{formatNumber(kgToUnit(totalVolumeKg, unit))}</span>
                <span className="summary-label">Hacim ({unit})</span>
              </div>
            </div>

            {newPrs.length > 0 && (
              <div className="pr-list">
                <h3><Trophy size="1em" aria-hidden="true" /> Yeni kişisel rekor{newPrs.length > 1 ? 'lar' : ''}!</h3>
                <ul>
                  {newPrs.map((p) => (
                    <li key={p.name}>
                      <span>{p.name}</span>
                      <strong>{formatWeight(p.weightKg, unit)} × {p.reps}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              {saveError && (
                <button className="btn-primary" onClick={() => saveSession(loggedSets)} disabled={saving}>
                  Tekrar Dene
                </button>
              )}
              {savedSessionId && !offlineSaved && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/share/${savedSessionId}`)}
                >
                  Özeti Paylaş
                </button>
              )}
              <button className="btn-primary" onClick={() => navigate('/calendar')} disabled={saving}>
                <CalendarDays size="1em" aria-hidden="true" /> Takvime Git
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutMode;
