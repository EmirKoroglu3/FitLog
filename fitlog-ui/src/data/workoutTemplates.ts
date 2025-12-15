// Hazır Antrenman Programı Şablonları
export interface ExerciseTemplate {
  name: string;
  icon: string;
  sets: number;
  reps: number;
}

export interface DayTemplate {
  dayOfWeek: number;
  name: string;
  exercises: ExerciseTemplate[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  daysPerWeek: number;
  icon: string;
  suitableFor: string[];
  days: DayTemplate[];
}

export const programCategories = [
  { id: 'beginner', name: 'Başlangıç', icon: '🌱' },
  { id: 'hypertrophy', name: 'Kas Yapma', icon: '💪' },
  { id: 'strength', name: 'Güç', icon: '⚡' },
  { id: 'weight-loss', name: 'Kilo Verme', icon: '🔥' },
  { id: 'general', name: 'Genel Sağlık', icon: '❤️' },
];

export const workoutTemplates: ProgramTemplate[] = [
  // BAŞLANGIÇ PROGRAMLARI
  {
    id: 'full-body-beginner',
    name: 'Full Body (Başlangıç)',
    description: 'Yeni başlayanlar için ideal tam vücut programı. Haftada 3 gün, tüm kas gruplarını çalıştırır.',
    category: 'beginner',
    difficulty: 'Başlangıç',
    daysPerWeek: 3,
    icon: '🌱',
    suitableFor: ['Kas Yapma', 'Genel Sağlık', 'Kilo Verme'],
    days: [
      {
        dayOfWeek: 1, // Pazartesi
        name: 'Full Body A',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 10 },
          { name: 'Bench Press', icon: '🏋️', sets: 3, reps: 10 },
          { name: 'Barbell Row', icon: '🚣', sets: 3, reps: 10 },
          { name: 'Overhead Press', icon: '⬆️', sets: 3, reps: 10 },
          { name: 'Plank', icon: '📏', sets: 3, reps: 30 },
        ]
      },
      {
        dayOfWeek: 3, // Çarşamba
        name: 'Full Body B',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 3, reps: 8 },
          { name: 'Dumbbell Shoulder Press', icon: '⬆️', sets: 3, reps: 10 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 3, reps: 10 },
          { name: 'Leg Press', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Crunch', icon: '🎯', sets: 3, reps: 15 },
        ]
      },
      {
        dayOfWeek: 5, // Cuma
        name: 'Full Body C',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 10 },
          { name: 'Dumbbell Fly', icon: '🦋', sets: 3, reps: 12 },
          { name: 'Seated Cable Row', icon: '🚣', sets: 3, reps: 10 },
          { name: 'Lateral Raise', icon: '↔️', sets: 3, reps: 12 },
          { name: 'Leg Raise', icon: '🦵', sets: 3, reps: 12 },
        ]
      }
    ]
  },

  // PUSH PULL LEGS
  {
    id: 'ppl-3day',
    name: 'Push-Pull-Legs (3 Gün)',
    description: 'Klasik PPL programı. İtme, çekme ve bacak günleri ile dengeli kas gelişimi.',
    category: 'hypertrophy',
    difficulty: 'Orta',
    daysPerWeek: 3,
    icon: '💪',
    suitableFor: ['Kas Yapma'],
    days: [
      {
        dayOfWeek: 1, // Pazartesi
        name: 'Push (İtme)',
        exercises: [
          { name: 'Bench Press', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Eğimli Bench Press', icon: '🏋️', sets: 3, reps: 10 },
          { name: 'Overhead Press', icon: '⬆️', sets: 3, reps: 10 },
          { name: 'Lateral Raise', icon: '↔️', sets: 4, reps: 15 },
          { name: 'Tricep Pushdown', icon: '⬇️', sets: 3, reps: 12 },
          { name: 'Overhead Tricep Extension', icon: '⬆️', sets: 3, reps: 12 },
        ]
      },
      {
        dayOfWeek: 3, // Çarşamba
        name: 'Pull (Çekme)',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 4, reps: 6 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 4, reps: 10 },
          { name: 'Barbell Row', icon: '🚣', sets: 4, reps: 10 },
          { name: 'Face Pull', icon: '🔙', sets: 3, reps: 15 },
          { name: 'Barbell Curl', icon: '💪', sets: 3, reps: 10 },
          { name: 'Hammer Curl', icon: '🔨', sets: 3, reps: 12 },
        ]
      },
      {
        dayOfWeek: 5, // Cuma
        name: 'Legs (Bacak)',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 4, reps: 8 },
          { name: 'Romanian Deadlift', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Leg Press', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Leg Curl', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Leg Extension', icon: '🦵', sets: 3, reps: 15 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
        ]
      }
    ]
  },

  {
    id: 'ppl-6day',
    name: 'Push-Pull-Legs (6 Gün)',
    description: 'İleri seviye PPL programı. Her kas grubu haftada 2 kez çalışılır.',
    category: 'hypertrophy',
    difficulty: 'İleri',
    daysPerWeek: 6,
    icon: '🔥',
    suitableFor: ['Kas Yapma'],
    days: [
      {
        dayOfWeek: 1,
        name: 'Push A',
        exercises: [
          { name: 'Bench Press', icon: '🏋️', sets: 4, reps: 8 },
          { name: 'Overhead Press', icon: '⬆️', sets: 4, reps: 10 },
          { name: 'Eğimli Bench Press', icon: '🏋️', sets: 3, reps: 10 },
          { name: 'Lateral Raise', icon: '↔️', sets: 4, reps: 15 },
          { name: 'Tricep Pushdown', icon: '⬇️', sets: 3, reps: 12 },
        ]
      },
      {
        dayOfWeek: 2,
        name: 'Pull A',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 4, reps: 5 },
          { name: 'Barbell Row', icon: '🚣', sets: 4, reps: 8 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 3, reps: 10 },
          { name: 'Face Pull', icon: '🔙', sets: 3, reps: 15 },
          { name: 'Barbell Curl', icon: '💪', sets: 3, reps: 10 },
        ]
      },
      {
        dayOfWeek: 3,
        name: 'Legs A',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 4, reps: 6 },
          { name: 'Romanian Deadlift', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Leg Press', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Leg Curl', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
        ]
      },
      {
        dayOfWeek: 4,
        name: 'Push B',
        exercises: [
          { name: 'Dumbbell Shoulder Press', icon: '⬆️', sets: 4, reps: 10 },
          { name: 'Dumbbell Fly', icon: '🦋', sets: 3, reps: 12 },
          { name: 'Cable Crossover', icon: '🔄', sets: 3, reps: 15 },
          { name: 'Lateral Raise', icon: '↔️', sets: 4, reps: 15 },
          { name: 'Skull Crusher', icon: '💀', sets: 3, reps: 10 },
        ]
      },
      {
        dayOfWeek: 5,
        name: 'Pull B',
        exercises: [
          { name: 'Barfiks', icon: '⬆️', sets: 4, reps: 8 },
          { name: 'Tek Kol Dumbbell Row', icon: '🚣', sets: 3, reps: 10 },
          { name: 'Seated Cable Row', icon: '🚣', sets: 3, reps: 12 },
          { name: 'Rear Delt Fly', icon: '🦋', sets: 3, reps: 15 },
          { name: 'Hammer Curl', icon: '🔨', sets: 3, reps: 12 },
        ]
      },
      {
        dayOfWeek: 6,
        name: 'Legs B',
        exercises: [
          { name: 'Front Squat', icon: '🦵', sets: 4, reps: 8 },
          { name: 'Hip Thrust', icon: '🍑', sets: 4, reps: 12 },
          { name: 'Bulgarian Split Squat', icon: '🦵', sets: 3, reps: 10 },
          { name: 'Leg Extension', icon: '🦵', sets: 3, reps: 15 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
        ]
      }
    ]
  },

  // UPPER/LOWER SPLIT
  {
    id: 'upper-lower-4day',
    name: 'Upper-Lower Split (4 Gün)',
    description: 'Üst vücut ve alt vücut ayrımı. Dengeli kas gelişimi ve yeterli dinlenme.',
    category: 'hypertrophy',
    difficulty: 'Orta',
    daysPerWeek: 4,
    icon: '💪',
    suitableFor: ['Kas Yapma', 'Güç Artırma'],
    days: [
      {
        dayOfWeek: 1,
        name: 'Upper A',
        exercises: [
          { name: 'Bench Press', icon: '🏋️', sets: 4, reps: 8 },
          { name: 'Barbell Row', icon: '🚣', sets: 4, reps: 8 },
          { name: 'Overhead Press', icon: '⬆️', sets: 3, reps: 10 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 3, reps: 10 },
          { name: 'Barbell Curl', icon: '💪', sets: 3, reps: 10 },
          { name: 'Tricep Pushdown', icon: '⬇️', sets: 3, reps: 12 },
        ]
      },
      {
        dayOfWeek: 2,
        name: 'Lower A',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 4, reps: 6 },
          { name: 'Romanian Deadlift', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Leg Press', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Leg Curl', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
          { name: 'Plank', icon: '📏', sets: 3, reps: 45 },
        ]
      },
      {
        dayOfWeek: 4,
        name: 'Upper B',
        exercises: [
          { name: 'Eğimli Bench Press', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Seated Cable Row', icon: '🚣', sets: 4, reps: 10 },
          { name: 'Dumbbell Shoulder Press', icon: '⬆️', sets: 3, reps: 10 },
          { name: 'Barfiks', icon: '⬆️', sets: 3, reps: 8 },
          { name: 'Hammer Curl', icon: '🔨', sets: 3, reps: 12 },
          { name: 'Skull Crusher', icon: '💀', sets: 3, reps: 10 },
        ]
      },
      {
        dayOfWeek: 5,
        name: 'Lower B',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 4, reps: 5 },
          { name: 'Front Squat', icon: '🦵', sets: 3, reps: 8 },
          { name: 'Hip Thrust', icon: '🍑', sets: 4, reps: 12 },
          { name: 'Leg Extension', icon: '🦵', sets: 3, reps: 15 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
          { name: 'Hanging Leg Raise', icon: '🦵', sets: 3, reps: 12 },
        ]
      }
    ]
  },

  // GÜÇ PROGRAMLARI
  {
    id: 'starting-strength',
    name: 'Starting Strength',
    description: 'Başlangıç güç programı. Compound hareketlerle hızlı güç kazanımı.',
    category: 'strength',
    difficulty: 'Başlangıç',
    daysPerWeek: 3,
    icon: '⚡',
    suitableFor: ['Güç Artırma', 'Kas Yapma'],
    days: [
      {
        dayOfWeek: 1,
        name: 'Workout A',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 5 },
          { name: 'Bench Press', icon: '🏋️', sets: 3, reps: 5 },
          { name: 'Deadlift', icon: '🏋️', sets: 1, reps: 5 },
        ]
      },
      {
        dayOfWeek: 3,
        name: 'Workout B',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 5 },
          { name: 'Overhead Press', icon: '⬆️', sets: 3, reps: 5 },
          { name: 'Barbell Row', icon: '🚣', sets: 3, reps: 5 },
        ]
      },
      {
        dayOfWeek: 5,
        name: 'Workout A',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 5 },
          { name: 'Bench Press', icon: '🏋️', sets: 3, reps: 5 },
          { name: 'Deadlift', icon: '🏋️', sets: 1, reps: 5 },
        ]
      }
    ]
  },

  // KİLO VERME PROGRAMLARI
  {
    id: 'fat-loss-circuit',
    name: 'Yağ Yakımı + Kardiyo',
    description: 'Ağırlık antrenmanı ve kardiyo kombinasyonu. Yağ yakımını maksimize eder.',
    category: 'weight-loss',
    difficulty: 'Orta',
    daysPerWeek: 4,
    icon: '🔥',
    suitableFor: ['Kilo Verme', 'Genel Sağlık'],
    days: [
      {
        dayOfWeek: 1,
        name: 'Full Body + HIIT',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Bench Press', icon: '🏋️', sets: 3, reps: 12 },
          { name: 'Barbell Row', icon: '🚣', sets: 3, reps: 12 },
          { name: 'Lunge', icon: '🚶', sets: 3, reps: 10 },
          { name: 'HIIT', icon: '⚡', sets: 1, reps: 20 },
        ]
      },
      {
        dayOfWeek: 2,
        name: 'Kardiyo',
        exercises: [
          { name: 'Koşu Bandı', icon: '🏃', sets: 1, reps: 30 },
          { name: 'Mountain Climber', icon: '🏔️', sets: 3, reps: 30 },
          { name: 'Burpee', icon: '💥', sets: 3, reps: 10 },
        ]
      },
      {
        dayOfWeek: 4,
        name: 'Full Body + HIIT',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 3, reps: 10 },
          { name: 'Overhead Press', icon: '⬆️', sets: 3, reps: 12 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 3, reps: 12 },
          { name: 'Leg Press', icon: '🦵', sets: 3, reps: 12 },
          { name: 'HIIT', icon: '⚡', sets: 1, reps: 20 },
        ]
      },
      {
        dayOfWeek: 5,
        name: 'Kardiyo',
        exercises: [
          { name: 'Bisiklet', icon: '🚴', sets: 1, reps: 30 },
          { name: 'İp Atlama', icon: '🪢', sets: 3, reps: 100 },
          { name: 'Kettlebell Swing', icon: '🔔', sets: 3, reps: 15 },
        ]
      }
    ]
  },

  // BRO SPLIT
  {
    id: 'bro-split-5day',
    name: 'Bro Split (5 Gün)',
    description: 'Klasik vücut geliştirme programı. Her gün farklı kas grubu.',
    category: 'hypertrophy',
    difficulty: 'Orta',
    daysPerWeek: 5,
    icon: '💪',
    suitableFor: ['Kas Yapma'],
    days: [
      {
        dayOfWeek: 1,
        name: 'Göğüs',
        exercises: [
          { name: 'Bench Press', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Eğimli Bench Press', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Dumbbell Fly', icon: '🦋', sets: 3, reps: 12 },
          { name: 'Cable Crossover', icon: '🔄', sets: 3, reps: 15 },
          { name: 'Dip (Göğüs)', icon: '⬇️', sets: 3, reps: 10 },
        ]
      },
      {
        dayOfWeek: 2,
        name: 'Sırt',
        exercises: [
          { name: 'Deadlift', icon: '🏋️', sets: 4, reps: 6 },
          { name: 'Lat Pulldown', icon: '⬇️', sets: 4, reps: 10 },
          { name: 'Barbell Row', icon: '🚣', sets: 4, reps: 10 },
          { name: 'Seated Cable Row', icon: '🚣', sets: 3, reps: 12 },
          { name: 'Face Pull', icon: '🔙', sets: 3, reps: 15 },
        ]
      },
      {
        dayOfWeek: 3,
        name: 'Omuz',
        exercises: [
          { name: 'Overhead Press', icon: '⬆️', sets: 4, reps: 10 },
          { name: 'Lateral Raise', icon: '↔️', sets: 4, reps: 15 },
          { name: 'Rear Delt Fly', icon: '🦋', sets: 4, reps: 15 },
          { name: 'Arnold Press', icon: '💪', sets: 3, reps: 10 },
          { name: 'Shrug', icon: '🤷', sets: 4, reps: 15 },
        ]
      },
      {
        dayOfWeek: 4,
        name: 'Bacak',
        exercises: [
          { name: 'Squat', icon: '🦵', sets: 4, reps: 8 },
          { name: 'Leg Press', icon: '🦵', sets: 4, reps: 12 },
          { name: 'Romanian Deadlift', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Leg Curl', icon: '🦵', sets: 3, reps: 12 },
          { name: 'Leg Extension', icon: '🦵', sets: 3, reps: 15 },
          { name: 'Calf Raise', icon: '🦶', sets: 4, reps: 15 },
        ]
      },
      {
        dayOfWeek: 5,
        name: 'Kol',
        exercises: [
          { name: 'Barbell Curl', icon: '💪', sets: 4, reps: 10 },
          { name: 'Close Grip Bench Press', icon: '🏋️', sets: 4, reps: 10 },
          { name: 'Hammer Curl', icon: '🔨', sets: 3, reps: 12 },
          { name: 'Skull Crusher', icon: '💀', sets: 3, reps: 10 },
          { name: 'Preacher Curl', icon: '🙏', sets: 3, reps: 12 },
          { name: 'Tricep Pushdown', icon: '⬇️', sets: 3, reps: 15 },
        ]
      }
    ]
  },
];

// Program şablonu arama
export function searchTemplates(query: string): ProgramTemplate[] {
  if (!query.trim()) return workoutTemplates;
  const lowerQuery = query.toLowerCase().trim();
  return workoutTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.suitableFor.some(s => s.toLowerCase().includes(lowerQuery))
  );
}

// Kategoriye göre şablonları getir
export function getTemplatesByCategory(categoryId: string): ProgramTemplate[] {
  return workoutTemplates.filter(t => t.category === categoryId);
}

// Hedefe göre uygun şablonları getir
export function getTemplatesByGoal(goal: string): ProgramTemplate[] {
  return workoutTemplates.filter(t => t.suitableFor.includes(goal));
}

// ID'ye göre şablon getir
export function getTemplateById(id: string): ProgramTemplate | undefined {
  return workoutTemplates.find(t => t.id === id);
}

