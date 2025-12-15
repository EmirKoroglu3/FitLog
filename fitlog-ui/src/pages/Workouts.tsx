import { useEffect, useState } from 'react';
import { WorkoutProgramDto } from '../types/workout';
import workoutService from '../services/workoutService';
import { exerciseCategories, searchExercises, ExerciseItem, getExercisesByCategory } from '../data/exerciseDatabase';
import { workoutTemplates, programCategories, ProgramTemplate, getTemplatesByCategory, DayTemplate, ExerciseTemplate } from '../data/workoutTemplates';
import './Workouts.css';

// Düzenlenebilir şablon tipi
interface EditableExercise extends ExerciseTemplate {
  id: string;
  weight?: number;
}

interface EditableDay extends Omit<DayTemplate, 'exercises'> {
  id: string;
  exercises: EditableExercise[];
}

interface EditableTemplate {
  name: string;
  description: string;
  days: EditableDay[];
}

export function Workouts() {
  const [programs, setPrograms] = useState<WorkoutProgramDto[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgramDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  // Program oluşturma mode: 'select' | 'template' | 'custom'
  const [programMode, setProgramMode] = useState<'select' | 'template' | 'custom'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [templateCategory, setTemplateCategory] = useState<string | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<ProgramTemplate[]>(workoutTemplates);
  
  // Düzenlenebilir şablon
  const [editableTemplate, setEditableTemplate] = useState<EditableTemplate | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  
  // Egzersiz arama state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  
  // Inline düzenleme state'i
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ setCount: 0, reps: 0, weight: 0 });
  
  // Form states
  const [programForm, setProgramForm] = useState({ name: '', description: '' });
  const [dayForm, setDayForm] = useState({ dayOfWeek: 1, name: '' });
  const [exerciseForm, setExerciseForm] = useState({
    name: '', setCount: 3, reps: 10, weight: 0, notes: ''
  });

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Egzersiz arama
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchExercises(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
      setActiveCategory(null);
    } else if (searchQuery.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getPrograms();
      setPrograms(data);
      if (data.length > 0 && !selectedProgram) {
        setSelectedProgram(data[0]);
      }
    } catch (err) {
      setError('Programlar yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProgram = await workoutService.createProgram(programForm);
      setPrograms([newProgram, ...programs]);
      setSelectedProgram(newProgram);
      closeProgramModal();
    } catch (err) {
      setError('Program oluşturulurken hata oluştu');
    }
  };

  // Şablon seçildiğinde düzenlenebilir hale getir
  const initEditableTemplate = (template: ProgramTemplate) => {
    // Haftanın 7 günü için tam liste oluştur (0=Pazar, 6=Cumartesi)
    const allDays: EditableDay[] = [];
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const existingDay = template.days.find(d => d.dayOfWeek === dayOfWeek);
      
      if (existingDay) {
        allDays.push({
          id: `day-${dayOfWeek}`,
          dayOfWeek,
          name: existingDay.name,
          exercises: existingDay.exercises.map((ex, idx) => ({
            ...ex,
            id: `ex-${dayOfWeek}-${idx}`,
            weight: undefined
          }))
        });
      } else {
        // Off Day
        allDays.push({
          id: `day-${dayOfWeek}`,
          dayOfWeek,
          name: 'Off Day',
          exercises: []
        });
      }
    }
    
    setEditableTemplate({
      name: template.name,
      description: template.description,
      days: allDays
    });
    setSelectedTemplate(template);
  };

  // Egzersiz ağırlığını güncelle
  const updateExerciseWeight = (dayId: string, exerciseId: string, weight: number) => {
    if (!editableTemplate) return;
    
    setEditableTemplate({
      ...editableTemplate,
      days: editableTemplate.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, weight };
          })
        };
      })
    });
  };

  // Egzersiz set/rep güncelle
  const updateExerciseDetails = (dayId: string, exerciseId: string, field: 'sets' | 'reps', value: number) => {
    if (!editableTemplate) return;
    
    setEditableTemplate({
      ...editableTemplate,
      days: editableTemplate.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, [field]: value };
          })
        };
      })
    });
  };

  // Egzersiz sil
  const removeExerciseFromTemplate = (dayId: string, exerciseId: string) => {
    if (!editableTemplate) return;
    
    setEditableTemplate({
      ...editableTemplate,
      days: editableTemplate.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          exercises: day.exercises.filter(ex => ex.id !== exerciseId)
        };
      })
    });
  };

  // Egzersiz ekle
  const addExerciseToTemplateDay = (dayId: string, exercise: ExerciseItem) => {
    if (!editableTemplate) return;
    
    setEditableTemplate({
      ...editableTemplate,
      days: editableTemplate.days.map(day => {
        if (day.id !== dayId) return day;
        
        // Off Day ise günü aktif hale getir
        const newName = day.exercises.length === 0 && day.name === 'Off Day' 
          ? exercise.muscleGroup 
          : day.name;
        
        return {
          ...day,
          name: newName,
          exercises: [
            ...day.exercises,
            {
              id: `ex-${day.dayOfWeek}-${Date.now()}`,
              name: exercise.name,
              icon: exercise.icon,
              sets: 3,
              reps: 10,
              weight: undefined
            }
          ]
        };
      })
    });
    setEditingDayId(null);
    setSearchQuery('');
  };

  // Günü Off Day yap
  const makeOffDay = (dayId: string) => {
    if (!editableTemplate) return;
    
    setEditableTemplate({
      ...editableTemplate,
      days: editableTemplate.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          name: 'Off Day',
          exercises: []
        };
      })
    });
  };

  const handleCreateFromTemplate = async () => {
    if (!editableTemplate) return;
    
    try {
      setCreating(true);
      
      // 1. Program oluştur
      const newProgram = await workoutService.createProgram({
        name: editableTemplate.name,
        description: editableTemplate.description
      });
      
      // 2. Sadece egzersizi olan günler için day ve exercise oluştur
      for (const day of editableTemplate.days) {
        if (day.exercises.length === 0) continue; // Off Day'leri atla
        
        const newDay = await workoutService.createDay({
          workoutProgramId: newProgram.id,
          dayOfWeek: day.dayOfWeek,
          name: day.name
        });
        
        // 3. Her egzersizi ekle
        for (const exercise of day.exercises) {
          await workoutService.createExercise({
            workoutDayId: newDay.id,
            name: `${exercise.icon} ${exercise.name}`,
            setCount: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: undefined
          });
        }
      }
      
      // Programları yeniden yükle
      await fetchPrograms();
      closeProgramModal();
    } catch (err) {
      setError('Şablon programı oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleTemplateCategory = (categoryId: string) => {
    if (templateCategory === categoryId) {
      setTemplateCategory(null);
      setFilteredTemplates(workoutTemplates);
    } else {
      setTemplateCategory(categoryId);
      setFilteredTemplates(getTemplatesByCategory(categoryId));
    }
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setProgramMode('select');
    setSelectedTemplate(null);
    setEditableTemplate(null);
    setEditingDayId(null);
    setTemplateCategory(null);
    setFilteredTemplates(workoutTemplates);
    setProgramForm({ name: '', description: '' });
    setSearchQuery('');
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Bu programı silmek istediğinizden emin misiniz?')) return;
    try {
      await workoutService.deleteProgram(id);
      const updated = programs.filter(p => p.id !== id);
      setPrograms(updated);
      setSelectedProgram(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      setError('Program silinirken hata oluştu');
    }
  };

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    try {
      const newDay = await workoutService.createDay({
        workoutProgramId: selectedProgram.id,
        dayOfWeek: dayForm.dayOfWeek,
        name: dayForm.name
      });
      const updatedProgram = {
        ...selectedProgram,
        workoutDays: [...selectedProgram.workoutDays, { ...newDay, exercises: [] }]
      };
      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
      setShowDayModal(false);
      setDayForm({ dayOfWeek: 1, name: '' });
    } catch (err) {
      setError('Gün eklenirken hata oluştu');
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!selectedProgram) return;
    try {
      await workoutService.deleteDay(dayId);
      const updatedProgram = {
        ...selectedProgram,
        workoutDays: selectedProgram.workoutDays.filter(d => d.id !== dayId)
      };
      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
    } catch (err) {
      setError('Gün silinirken hata oluştu');
    }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !selectedDayId || !exerciseForm.name) return;
    try {
      const exerciseName = selectedExercise 
        ? `${selectedExercise.icon} ${exerciseForm.name}`
        : exerciseForm.name;

      const newExercise = await workoutService.createExercise({
        workoutDayId: selectedDayId,
        name: exerciseName,
        setCount: exerciseForm.setCount,
        reps: exerciseForm.reps,
        weight: exerciseForm.weight || undefined,
        notes: exerciseForm.notes || undefined
      });
      
      const updatedProgram = {
        ...selectedProgram,
        workoutDays: selectedProgram.workoutDays.map(day => 
          day.id === selectedDayId 
            ? { ...day, exercises: [...day.exercises, newExercise] }
            : day
        )
      };
      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
      closeExerciseModal();
    } catch (err) {
      setError('Egzersiz eklenirken hata oluştu');
    }
  };

  const handleDeleteExercise = async (dayId: string, exerciseId: string) => {
    if (!selectedProgram) return;
    try {
      await workoutService.deleteExercise(exerciseId);
      const updatedProgram = {
        ...selectedProgram,
        workoutDays: selectedProgram.workoutDays.map(day => 
          day.id === dayId 
            ? { ...day, exercises: day.exercises.filter(e => e.id !== exerciseId) }
            : day
        )
      };
      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
    } catch (err) {
      setError('Egzersiz silinirken hata oluştu');
    }
  };

  // Inline düzenleme başlat
  const startEditingExercise = (exercise: { id: string; setCount: number; reps: number; weight?: number }) => {
    setEditingExerciseId(exercise.id);
    setEditForm({
      setCount: exercise.setCount,
      reps: exercise.reps,
      weight: exercise.weight || 0
    });
  };

  // Inline düzenleme kaydet
  const saveExerciseEdit = async (dayId: string, exerciseId: string) => {
    if (!selectedProgram) return;
    try {
      const updated = await workoutService.updateExercise(exerciseId, {
        setCount: editForm.setCount,
        reps: editForm.reps,
        weight: editForm.weight || undefined
      });
      
      const updatedProgram = {
        ...selectedProgram,
        workoutDays: selectedProgram.workoutDays.map(day => 
          day.id === dayId 
            ? { 
                ...day, 
                exercises: day.exercises.map(e => 
                  e.id === exerciseId 
                    ? { ...e, setCount: updated.setCount, reps: updated.reps, weight: updated.weight }
                    : e
                )
              }
            : day
        )
      };
      setSelectedProgram(updatedProgram);
      setPrograms(programs.map(p => p.id === selectedProgram.id ? updatedProgram : p));
      setEditingExerciseId(null);
    } catch (err) {
      setError('Egzersiz güncellenirken hata oluştu');
    }
  };

  // Düzenleme iptal
  const cancelEditingExercise = () => {
    setEditingExerciseId(null);
    setEditForm({ setCount: 0, reps: 0, weight: 0 });
  };

  const selectExercise = (exercise: ExerciseItem) => {
    setSelectedExercise(exercise);
    setExerciseForm({
      name: exercise.name,
      setCount: exercise.defaultSets,
      reps: exercise.defaultReps,
      weight: 0,
      notes: ''
    });
    setSearchQuery('');
    setShowSearchResults(false);
    setActiveCategory(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      setActiveCategory(categoryId);
      setSearchResults(getExercisesByCategory(categoryId));
      setShowSearchResults(true);
      setSearchQuery('');
    }
  };

  const closeExerciseModal = () => {
    setShowExerciseModal(false);
    setSelectedExercise(null);
    setSearchQuery('');
    setSearchResults([]);
    setActiveCategory(null);
    setExerciseForm({ name: '', setCount: 3, reps: 10, weight: 0, notes: '' });
  };

  const openExerciseModal = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowExerciseModal(true);
  };

  if (loading) {
    return (
      <div className="workouts-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <div className="container">
        <div className="workouts-header">
          <h1>🏋️ Antrenman Programları</h1>
          <button className="btn-primary" onClick={() => setShowProgramModal(true)}>
            + Yeni Program
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="workouts-layout">
          {/* Program Listesi */}
          <aside className="programs-sidebar">
            <h3>Programlarım</h3>
            {programs.length === 0 ? (
              <p className="no-data">Henüz program yok</p>
            ) : (
              <ul className="program-list">
                {programs.map(program => (
                  <li 
                    key={program.id}
                    className={`program-item ${selectedProgram?.id === program.id ? 'active' : ''}`}
                    onClick={() => setSelectedProgram(program)}
                  >
                    <span className="program-name">{program.name}</span>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteProgram(program.id); }}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Program Detay */}
          <main className="program-detail">
            {selectedProgram ? (
              <>
                <div className="program-header">
                  <div>
                    <h2>{selectedProgram.name}</h2>
                    {selectedProgram.description && (
                      <p className="program-desc">{selectedProgram.description}</p>
                    )}
                  </div>
                  <button className="btn-secondary" onClick={() => setShowDayModal(true)}>
                    + Gün Ekle
                  </button>
                </div>

                <div className="workout-days">
                  {selectedProgram.workoutDays.length === 0 ? (
                    <div className="empty-state">
                      <p>Bu programda henüz gün yok. Gün ekleyerek başla!</p>
                    </div>
                  ) : (
                    [...selectedProgram.workoutDays]
                      .sort((a, b) => {
                        // Pazartesi'den başla (1), Pazar sona (0 -> 7)
                        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                        return orderA - orderB;
                      })
                      .map(day => (
                      <div key={day.id} className="day-card card">
                        <div className="day-header">
                          <h3>
                            <span className="day-badge">{dayNames[day.dayOfWeek]}</span>
                            {day.name && <span className="day-name">{day.name}</span>}
                          </h3>
                          <div className="day-actions">
                            <button 
                              className="btn-icon"
                              onClick={() => openExerciseModal(day.id)}
                            >
                              ➕
                            </button>
                            <button 
                              className="btn-icon btn-delete"
                              onClick={() => handleDeleteDay(day.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {day.exercises.length === 0 ? (
                          <p className="no-exercises">Egzersiz ekle</p>
                        ) : (
                          <table className="exercises-table">
                            <thead>
                              <tr>
                                <th>Egzersiz</th>
                                <th>Set</th>
                                <th>Tekrar</th>
                                <th>Ağırlık</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.exercises.map(exercise => (
                                <tr key={exercise.id} className={editingExerciseId === exercise.id ? 'editing' : ''}>
                                  <td>{exercise.name}</td>
                                  {editingExerciseId === exercise.id ? (
                                    <>
                                      <td>
                                        <input 
                                          type="number" 
                                          className="inline-edit-input"
                                          value={editForm.setCount}
                                          onChange={(e) => setEditForm({...editForm, setCount: parseInt(e.target.value) || 0})}
                                          min="1"
                                          max="20"
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="number" 
                                          className="inline-edit-input"
                                          value={editForm.reps}
                                          onChange={(e) => setEditForm({...editForm, reps: parseInt(e.target.value) || 0})}
                                          min="1"
                                          max="100"
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="number" 
                                          className="inline-edit-input weight"
                                          value={editForm.weight || ''}
                                          onChange={(e) => setEditForm({...editForm, weight: parseFloat(e.target.value) || 0})}
                                          placeholder="-"
                                          min="0"
                                          step="0.5"
                                        />
                                      </td>
                                      <td className="action-buttons">
                                        <button 
                                          className="btn-icon btn-save"
                                          onClick={() => saveExerciseEdit(day.id, exercise.id)}
                                          title="Kaydet"
                                        >
                                          ✓
                                        </button>
                                        <button 
                                          className="btn-icon btn-cancel"
                                          onClick={cancelEditingExercise}
                                          title="İptal"
                                        >
                                          ✕
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td>{exercise.setCount}</td>
                                      <td>{exercise.reps}</td>
                                      <td>{exercise.weight ? `${exercise.weight} kg` : '-'}</td>
                                      <td className="action-buttons">
                                        <button 
                                          className="btn-icon btn-edit"
                                          onClick={() => startEditingExercise(exercise)}
                                          title="Düzenle"
                                        >
                                          ✏️
                                        </button>
                                        <button 
                                          className="btn-icon btn-delete small"
                                          onClick={() => handleDeleteExercise(day.id, exercise.id)}
                                          title="Sil"
                                        >
                                          ✕
                                        </button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>Program Seçilmedi</h3>
                <p>Sol taraftan bir program seç veya yeni program oluştur</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <div className="modal-overlay" onClick={closeProgramModal}>
          <div className="modal program-modal" onClick={e => e.stopPropagation()}>
            <h2>Yeni Antrenman Programı</h2>
            
            {/* Mode Seçimi */}
            {programMode === 'select' && (
              <div className="program-mode-select">
                <p className="mode-description">Nasıl bir program oluşturmak istiyorsun?</p>
                
                <div className="mode-options">
                  <div 
                    className="mode-option template-option"
                    onClick={() => setProgramMode('template')}
                  >
                    <span className="mode-icon">📋</span>
                    <h3>Hazır Şablon Kullan</h3>
                    <p>Push-Pull-Legs, Full Body, Bro Split gibi hazır programlardan seç</p>
                  </div>
                  
                  <div 
                    className="mode-option custom-option"
                    onClick={() => setProgramMode('custom')}
                  >
                    <span className="mode-icon">✏️</span>
                    <h3>Kendi Programımı Oluştur</h3>
                    <p>Sıfırdan kendi antrenman programını tasarla</p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeProgramModal}>
                    İptal
                  </button>
                </div>
              </div>
            )}

            {/* Şablon Seçimi */}
            {programMode === 'template' && !selectedTemplate && (
              <div className="template-select-section">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setProgramMode('select')}
                >
                  ← Geri
                </button>

                <div className="template-categories">
                  {programCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-btn ${templateCategory === cat.id ? 'active' : ''}`}
                      onClick={() => handleTemplateCategory(cat.id)}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="templates-list">
                  {filteredTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="template-card"
                      onClick={() => initEditableTemplate(template)}
                    >
                      <div className="template-header">
                        <span className="template-icon">{template.icon}</span>
                        <div className="template-info">
                          <h4>{template.name}</h4>
                          <span className="template-meta">
                            {template.daysPerWeek} gün/hafta • {template.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="template-desc">{template.description}</p>
                      <div className="template-tags">
                        {template.suitableFor.map(tag => (
                          <span key={tag} className="template-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeProgramModal}>
                    İptal
                  </button>
                </div>
              </div>
            )}

            {/* Şablon Düzenleme */}
            {programMode === 'template' && selectedTemplate && editableTemplate && (
              <div className="template-editor-section">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => { setSelectedTemplate(null); setEditableTemplate(null); }}
                >
                  ← Geri
                </button>

                <div className="template-preview-header">
                  <span className="preview-icon">{selectedTemplate.icon}</span>
                  <div>
                    <h3>{editableTemplate.name}</h3>
                    <p>{editableTemplate.description}</p>
                    <span className="edit-hint">💡 Egzersizleri düzenleyebilir, ağırlık ekleyebilir veya kaldırabilirsin</span>
                  </div>
                </div>

                <div className="template-week-view">
                  {editableTemplate.days.map((day) => (
                    <div key={day.id} className={`week-day-card ${day.exercises.length === 0 ? 'off-day' : ''}`}>
                      <div className="week-day-header">
                        <span className="week-day-badge">{dayNames[day.dayOfWeek]}</span>
                        <span className="week-day-name">
                          {day.exercises.length === 0 ? '😴 Off Day' : day.name}
                        </span>
                        {day.exercises.length > 0 && (
                          <button 
                            type="button"
                            className="btn-icon-small btn-off"
                            onClick={() => makeOffDay(day.id)}
                            title="Off Day Yap"
                          >
                            ❌
                          </button>
                        )}
                      </div>

                      {day.exercises.length > 0 ? (
                        <div className="week-day-exercises">
                          {day.exercises.map((ex) => (
                            <div key={ex.id} className="editable-exercise">
                              <div className="exercise-main">
                                <span className="exercise-icon">{ex.icon}</span>
                                <span className="exercise-name">{ex.name}</span>
                                <button 
                                  type="button"
                                  className="btn-remove-exercise"
                                  onClick={() => removeExerciseFromTemplate(day.id, ex.id)}
                                >
                                  ×
                                </button>
                              </div>
                              <div className="exercise-inputs">
                                <div className="input-group">
                                  <label>Set</label>
                                  <input 
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => updateExerciseDetails(day.id, ex.id, 'sets', parseInt(e.target.value) || 3)}
                                    min="1"
                                    max="10"
                                  />
                                </div>
                                <span className="input-separator">×</span>
                                <div className="input-group">
                                  <label>Rep</label>
                                  <input 
                                    type="number"
                                    value={ex.reps}
                                    onChange={(e) => updateExerciseDetails(day.id, ex.id, 'reps', parseInt(e.target.value) || 10)}
                                    min="1"
                                    max="100"
                                  />
                                </div>
                                <div className="input-group weight-group">
                                  <label>Kg</label>
                                  <input 
                                    type="number"
                                    value={ex.weight || ''}
                                    onChange={(e) => updateExerciseWeight(day.id, ex.id, parseFloat(e.target.value) || 0)}
                                    placeholder="-"
                                    min="0"
                                    step="0.5"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Egzersiz Ekle */}
                      {editingDayId === day.id ? (
                        <div className="add-exercise-search">
                          <input
                            type="text"
                            placeholder="Egzersiz ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                          {searchQuery.length >= 2 && (
                            <div className="search-results-mini">
                              {searchExercises(searchQuery).slice(0, 5).map((ex) => (
                                <div 
                                  key={ex.id}
                                  className="search-result-item"
                                  onClick={() => addExerciseToTemplateDay(day.id, ex)}
                                >
                                  <span>{ex.icon} {ex.name}</span>
                                  <span className="muscle-group">{ex.muscleGroup}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button 
                            type="button" 
                            className="btn-cancel-search"
                            onClick={() => { setEditingDayId(null); setSearchQuery(''); }}
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          className="btn-add-exercise"
                          onClick={() => setEditingDayId(day.id)}
                        >
                          + Egzersiz Ekle
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeProgramModal}>
                    İptal
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleCreateFromTemplate}
                    disabled={creating || editableTemplate.days.every(d => d.exercises.length === 0)}
                  >
                    {creating ? 'Oluşturuluyor...' : 'Programı Oluştur'}
                  </button>
                </div>
              </div>
            )}

            {/* Kendi Programını Oluştur */}
            {programMode === 'custom' && (
              <form onSubmit={handleCreateProgram}>
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setProgramMode('select')}
                >
                  ← Geri
                </button>

                <div className="form-group">
                  <label>Program Adı</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={e => setProgramForm({...programForm, name: e.target.value})}
                    placeholder="Örn: Benim Programım"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Açıklama (Opsiyonel)</label>
                  <textarea
                    value={programForm.description}
                    onChange={e => setProgramForm({...programForm, description: e.target.value})}
                    placeholder="Program hakkında notlar..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeProgramModal}>
                    İptal
                  </button>
                  <button type="submit" className="btn-primary">
                    Oluştur
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Day Modal */}
      {showDayModal && (
        <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Yeni Antrenman Günü</h2>
            <form onSubmit={handleCreateDay}>
              <div className="form-group">
                <label>Gün</label>
                <select
                  value={dayForm.dayOfWeek}
                  onChange={e => setDayForm({...dayForm, dayOfWeek: parseInt(e.target.value)})}
                >
                  {dayNames.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>İsim (Opsiyonel)</label>
                <input
                  type="text"
                  value={dayForm.name}
                  onChange={e => setDayForm({...dayForm, name: e.target.value})}
                  placeholder="Örn: Göğüs Günü"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDayModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="modal-overlay" onClick={closeExerciseModal}>
          <div className="modal exercise-modal" onClick={e => e.stopPropagation()}>
            <h2>Egzersiz Ekle</h2>
            <form onSubmit={handleCreateExercise}>
              
              {/* Egzersiz Seçimi - Henüz seçilmediyse göster */}
              {!selectedExercise && (
                <div className="exercise-search-section">
                  <label>Egzersiz Ara veya Kas Grubu Seç</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="🔍 Egzersiz ara... (örn: bench press, squat, deadlift)"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                      className="exercise-search-input"
                    />
                    {searchQuery && (
                      <button 
                        type="button" 
                        className="clear-search"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Kategori Butonları */}
                  <div className="exercise-categories">
                    {exerciseCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.id)}
                      >
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-name">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Arama Sonuçları */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(exercise => (
                        <div 
                          key={exercise.id} 
                          className="exercise-result-item"
                          onClick={() => selectExercise(exercise)}
                        >
                          <div className="exercise-result-left">
                            <span className="exercise-icon">{exercise.icon}</span>
                            <div className="exercise-info">
                              <span className="exercise-name">{exercise.name}</span>
                              <span className="exercise-muscle">{exercise.muscleGroup}</span>
                            </div>
                          </div>
                          <div className="exercise-result-right">
                            <span className="exercise-equipment">{exercise.equipment}</span>
                            <span className="exercise-default">{exercise.defaultSets}x{exercise.defaultReps}</span>
                          </div>
                          <button type="button" className="add-exercise-btn">+</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="no-results">
                      <span>🔍</span>
                      <p>"{searchQuery}" için sonuç bulunamadı</p>
                    </div>
                  )}
                </div>
              )}

              {/* Seçilen Egzersiz Bilgisi */}
              {selectedExercise && (
                <>
                  <div className="selected-exercise-info">
                    <div className="selected-exercise-header">
                      <span className="selected-icon">{selectedExercise.icon}</span>
                      <div>
                        <h3>{selectedExercise.name}</h3>
                        <p>{selectedExercise.muscleGroup} • {selectedExercise.equipment}</p>
                      </div>
                      <button 
                        type="button" 
                        className="change-exercise-btn"
                        onClick={() => {
                          setSelectedExercise(null);
                          setExerciseForm({ name: '', setCount: 3, reps: 10, weight: 0, notes: '' });
                        }}
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>

                  {/* Set, Tekrar, Ağırlık Ayarları */}
                  <div className="exercise-settings">
                    <div className="setting-group">
                      <label>Set Sayısı</label>
                      <div className="number-input">
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, setCount: Math.max(1, exerciseForm.setCount - 1)})}
                        >−</button>
                        <span>{exerciseForm.setCount}</span>
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, setCount: exerciseForm.setCount + 1})}
                        >+</button>
                      </div>
                    </div>

                    <div className="setting-group">
                      <label>Tekrar</label>
                      <div className="number-input">
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, reps: Math.max(1, exerciseForm.reps - 1)})}
                        >−</button>
                        <span>{exerciseForm.reps}</span>
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, reps: exerciseForm.reps + 1})}
                        >+</button>
                      </div>
                    </div>

                    <div className="setting-group">
                      <label>Ağırlık (kg)</label>
                      <div className="number-input weight-input">
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, weight: Math.max(0, exerciseForm.weight - 2.5)})}
                        >−</button>
                        <input
                          type="number"
                          value={exerciseForm.weight}
                          onChange={e => setExerciseForm({...exerciseForm, weight: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.5"
                        />
                        <button 
                          type="button"
                          onClick={() => setExerciseForm({...exerciseForm, weight: exerciseForm.weight + 2.5})}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notlar (Opsiyonel)</label>
                    <input
                      type="text"
                      value={exerciseForm.notes}
                      onChange={e => setExerciseForm({...exerciseForm, notes: e.target.value})}
                      placeholder="Örn: Yavaş tempo, Drop set"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeExerciseModal}>
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!selectedExercise}
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workouts;
