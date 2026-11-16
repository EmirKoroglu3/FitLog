// Egzersiz veritabanı
export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  icon: string;
}

export const exerciseCategories = [
  { id: 'chest', name: 'Göğüs', icon: '🫁' },
  { id: 'back', name: 'Sırt', icon: '🔙' },
  { id: 'shoulders', name: 'Omuz', icon: '💪' },
  { id: 'biceps', name: 'Biceps', icon: '💪' },
  { id: 'triceps', name: 'Triceps', icon: '💪' },
  { id: 'legs', name: 'Bacak', icon: '🦵' },
  { id: 'glutes', name: 'Kalça', icon: '🍑' },
  { id: 'core', name: 'Karın', icon: '🎯' },
  { id: 'cardio', name: 'Kardiyo', icon: '❤️' },
  { id: 'compound', name: 'Çoklu Kas', icon: '🏋️' },
];

export const exerciseDatabase: ExerciseItem[] = [
  // GÖĞÜS
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    muscleGroup: 'Göğüs, Ön Omuz, Triceps',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'incline-bench-press',
    name: 'Eğimli Bench Press',
    category: 'chest',
    muscleGroup: 'Üst Göğüs',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    category: 'chest',
    muscleGroup: 'Alt Göğüs',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🦋'
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🔄'
  },
  {
    id: 'push-up',
    name: 'Şınav',
    category: 'chest',
    muscleGroup: 'Göğüs, Triceps',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🙌'
  },
  {
    id: 'chest-press-machine',
    name: 'Chest Press Makinesi',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🎰'
  },
  {
    id: 'dip-chest',
    name: 'Dip (Göğüs)',
    category: 'chest',
    muscleGroup: 'Alt Göğüs, Triceps',
    equipment: 'Paralel Bar',
    defaultSets: 3,
    defaultReps: 10,
    icon: '⬇️'
  },

  // SIRT
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    muscleGroup: 'Latissimus',
    equipment: 'Cable',
    defaultSets: 4,
    defaultReps: 12,
    icon: '⬇️'
  },
  {
    id: 'pull-up',
    name: 'Barfiks',
    category: 'back',
    muscleGroup: 'Latissimus, Biceps',
    equipment: 'Bar',
    defaultSets: 4,
    defaultReps: 8,
    icon: '⬆️'
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    category: 'back',
    muscleGroup: 'Orta Sırt',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🚣'
  },
  {
    id: 'dumbbell-row',
    name: 'Tek Kol Dumbbell Row',
    category: 'back',
    muscleGroup: 'Latissimus, Orta Sırt',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🚣'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    category: 'back',
    muscleGroup: 'Orta Sırt',
    equipment: 'Cable',
    defaultSets: 4,
    defaultReps: 12,
    icon: '🚣'
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    category: 'back',
    muscleGroup: 'Orta Sırt',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🚣'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'back',
    muscleGroup: 'Alt Sırt, Bacak, Kalça',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 6,
    icon: '🏋️'
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    category: 'back',
    muscleGroup: 'Arka Omuz, Üst Sırt',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🔙'
  },

  // OMUZ
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz, Lateral',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '⬆️'
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz',
    equipment: 'Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '⬆️'
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    category: 'shoulders',
    muscleGroup: 'Lateral Omuz',
    equipment: 'Dumbbell',
    defaultSets: 4,
    defaultReps: 15,
    icon: '↔️'
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '⬆️'
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    category: 'shoulders',
    muscleGroup: 'Arka Omuz',
    equipment: 'Dumbbell / Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🦋'
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    category: 'shoulders',
    muscleGroup: 'Tüm Omuz',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '💪'
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    category: 'shoulders',
    muscleGroup: 'Trapez, Lateral',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '⬆️'
  },
  {
    id: 'shrug',
    name: 'Shrug',
    category: 'shoulders',
    muscleGroup: 'Trapez',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 4,
    defaultReps: 15,
    icon: '🤷'
  },

  // BICEPS
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '💪'
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '💪'
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'biceps',
    muscleGroup: 'Biceps, Brachialis',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🔨'
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🙏'
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🎯'
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '💪'
  },

  // TRICEPS
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    defaultSets: 4,
    defaultReps: 12,
    icon: '⬇️'
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Barbell / EZ Bar',
    defaultSets: 3,
    defaultReps: 10,
    icon: '💀'
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    category: 'triceps',
    muscleGroup: 'Triceps Uzun Baş',
    equipment: 'Dumbbell / Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '⬆️'
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close Grip Bench Press',
    category: 'triceps',
    muscleGroup: 'Triceps, Göğüs',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'tricep-dip',
    name: 'Tricep Dip',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Paralel Bar / Bench',
    defaultSets: 3,
    defaultReps: 12,
    icon: '⬇️'
  },
  {
    id: 'kickback',
    name: 'Tricep Kickback',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🦵'
  },

  // BACAK
  {
    id: 'squat',
    name: 'Squat',
    category: 'legs',
    muscleGroup: 'Quadriceps, Kalça',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 8,
    icon: '🦵'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    muscleGroup: 'Quadriceps, Kalça',
    equipment: 'Makine',
    defaultSets: 4,
    defaultReps: 12,
    icon: '🦵'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'legs',
    muscleGroup: 'Quadriceps',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🦵'
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    category: 'legs',
    muscleGroup: 'Hamstring',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🦵'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'legs',
    muscleGroup: 'Hamstring, Kalça',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'lunge',
    name: 'Lunge',
    category: 'legs',
    muscleGroup: 'Quadriceps, Kalça',
    equipment: 'Dumbbell / Barbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🚶'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    muscleGroup: 'Quadriceps, Kalça',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🦵'
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'legs',
    muscleGroup: 'Baldır',
    equipment: 'Makine / Vücut Ağırlığı',
    defaultSets: 4,
    defaultReps: 15,
    icon: '🦶'
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'legs',
    muscleGroup: 'Quadriceps',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 8,
    icon: '🦵'
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    category: 'legs',
    muscleGroup: 'Quadriceps',
    equipment: 'Makine',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🦵'
  },

  // KALÇA
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 12,
    icon: '🍑'
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🍑'
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🍑'
  },
  {
    id: 'sumo-squat',
    name: 'Sumo Squat',
    category: 'glutes',
    muscleGroup: 'Kalça, İç Bacak',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🦵'
  },
  {
    id: 'step-up',
    name: 'Step Up',
    category: 'glutes',
    muscleGroup: 'Kalça, Quadriceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '📦'
  },

  // KARIN
  {
    id: 'crunch',
    name: 'Crunch',
    category: 'core',
    muscleGroup: 'Üst Karın',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 20,
    icon: '🎯'
  },
  {
    id: 'leg-raise',
    name: 'Leg Raise',
    category: 'core',
    muscleGroup: 'Alt Karın',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🦵'
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    muscleGroup: 'Core',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 60,
    icon: '📏'
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    muscleGroup: 'Oblique',
    equipment: 'Vücut Ağırlığı / Ağırlık',
    defaultSets: 3,
    defaultReps: 20,
    icon: '🔄'
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    category: 'core',
    muscleGroup: 'Karın',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🎯'
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    category: 'core',
    muscleGroup: 'Core',
    equipment: 'Ab Wheel',
    defaultSets: 3,
    defaultReps: 10,
    icon: '🛞'
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climber',
    category: 'core',
    muscleGroup: 'Core, Kalp',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 30,
    icon: '🏔️'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'core',
    muscleGroup: 'Alt Karın',
    equipment: 'Bar',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🦵'
  },

  // KARDİYO
  {
    id: 'treadmill',
    name: 'Koşu Bandı',
    category: 'cardio',
    muscleGroup: 'Kalp, Bacak',
    equipment: 'Koşu Bandı',
    defaultSets: 1,
    defaultReps: 30,
    icon: '🏃'
  },
  {
    id: 'stationary-bike',
    name: 'Bisiklet',
    category: 'cardio',
    muscleGroup: 'Kalp, Bacak',
    equipment: 'Bisiklet',
    defaultSets: 1,
    defaultReps: 30,
    icon: '🚴'
  },
  {
    id: 'rowing-machine',
    name: 'Kürek Makinesi',
    category: 'cardio',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Kürek',
    defaultSets: 1,
    defaultReps: 20,
    icon: '🚣'
  },
  {
    id: 'elliptical',
    name: 'Eliptik',
    category: 'cardio',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Eliptik',
    defaultSets: 1,
    defaultReps: 30,
    icon: '🏃'
  },
  {
    id: 'jump-rope',
    name: 'İp Atlama',
    category: 'cardio',
    muscleGroup: 'Kalp, Bacak',
    equipment: 'İp',
    defaultSets: 3,
    defaultReps: 100,
    icon: '🪢'
  },
  {
    id: 'hiit',
    name: 'HIIT',
    category: 'cardio',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Çeşitli',
    defaultSets: 1,
    defaultReps: 20,
    icon: '⚡'
  },
  {
    id: 'stair-climber',
    name: 'Merdiven Makinesi',
    category: 'cardio',
    muscleGroup: 'Bacak, Kalça',
    equipment: 'Merdiven',
    defaultSets: 1,
    defaultReps: 15,
    icon: '🪜'
  },

  // ÇOKLU KAS
  {
    id: 'clean-and-jerk',
    name: 'Clean and Jerk',
    category: 'compound',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Barbell',
    defaultSets: 5,
    defaultReps: 3,
    icon: '🏋️'
  },
  {
    id: 'snatch',
    name: 'Snatch',
    category: 'compound',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Barbell',
    defaultSets: 5,
    defaultReps: 3,
    icon: '🏋️'
  },
  {
    id: 'thruster',
    name: 'Thruster',
    category: 'compound',
    muscleGroup: 'Bacak, Omuz',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🏋️'
  },
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'compound',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '💥'
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'compound',
    muscleGroup: 'Kalça, Sırt',
    equipment: 'Kettlebell',
    defaultSets: 4,
    defaultReps: 15,
    icon: '🔔'
  },
  {
    id: 'farmers-walk',
    name: 'Farmer\'s Walk',
    category: 'compound',
    muscleGroup: 'Core, Kavrama',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 40,
    icon: '🚶'
  },

  // KALÇA ODAKLI EK HAREKETLER
  {
    id: 'hip-abduction-machine',
    name: 'Hip Abduction Makinesi',
    category: 'glutes',
    muscleGroup: 'Kalça (Yan)',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 15,
    icon: ''
  },
  {
    id: 'cable-abduction',
    name: 'Cable Hip Abduction',
    category: 'glutes',
    muscleGroup: 'Kalça (Yan)',
    equipment: 'Kablo',
    defaultSets: 3,
    defaultReps: 12,
    icon: ''
  },
  {
    id: 'b-stance-hip-thrust',
    name: 'B-Stance Hip Thrust',
    category: 'glutes',
    muscleGroup: 'Kalça, Hamstring',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: ''
  },
  {
    id: 'frog-pump',
    name: 'Frog Pump',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 20,
    icon: ''
  },
  {
    id: 'mini-band-walk',
    name: 'Mini Band Yan Yürüyüş',
    category: 'glutes',
    muscleGroup: 'Kalça (Yan)',
    equipment: 'Mini Band',
    defaultSets: 3,
    defaultReps: 20,
    icon: ''
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'legs',
    muscleGroup: 'Kalça, Quadriceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: ''
  },
  {
    id: 'curtsy-lunge',
    name: 'Curtsy Lunge',
    category: 'legs',
    muscleGroup: 'Kalça, İç Bacak',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: ''
  },
  {
    id: 'single-leg-rdl',
    name: 'Tek Bacak Romanian Deadlift',
    category: 'legs',
    muscleGroup: 'Hamstring, Kalça',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: ''
  },
  {
    id: 'good-morning',
    name: 'Good Morning',
    category: 'legs',
    muscleGroup: 'Hamstring, Bel, Kalça',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: ''
  },
];

// Egzersiz arama fonksiyonu
export function searchExercises(query: string): ExerciseItem[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  return exerciseDatabase.filter(exercise => 
    exercise.name.toLowerCase().includes(lowerQuery) ||
    exercise.muscleGroup.toLowerCase().includes(lowerQuery) ||
    exercise.equipment.toLowerCase().includes(lowerQuery)
  );
}

// Kategoriye göre egzersizleri getir
export function getExercisesByCategory(categoryId: string): ExerciseItem[] {
  return exerciseDatabase.filter(exercise => exercise.category === categoryId);
}

// ID'ye göre egzersiz getir
export function getExerciseById(id: string): ExerciseItem | undefined {
  return exerciseDatabase.find(exercise => exercise.id === id);
}

