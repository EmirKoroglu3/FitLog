import { foodMatchScore } from './foodSearch';
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
  /** Other names people search for (Turkish/English, gym slang). */
  aliases?: string[];
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
    icon: '🦋',
    aliases: ['dumbbell açış', 'göğüs açma']
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🔄',
    aliases: ['cable fly', 'kablo fly']
  },
  {
    id: 'push-up',
    name: 'Şınav',
    category: 'chest',
    muscleGroup: 'Göğüs, Triceps',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🙌',
    aliases: ['push up']
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
    icon: '⬆️',
    aliases: ['pull up', 'barfiks']
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
    icon: '↔️',
    aliases: ['yana açış', 'yan omuz']
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '⬆️',
    aliases: ['öne kaldırış', 'ön omuz']
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    category: 'shoulders',
    muscleGroup: 'Arka Omuz',
    equipment: 'Dumbbell / Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🦋',
    aliases: ['arka omuz', 'ters açış']
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
    icon: '🙏',
    aliases: ['scott curl']
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
    icon: '⬇️',
    aliases: ['triceps pushdown', 'kablo triceps']
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Barbell / EZ Bar',
    defaultSets: 3,
    defaultReps: 10,
    icon: '💀',
    aliases: ['french press', 'yatarak triceps']
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
    icon: '🦵',
    aliases: ['ön bacak makinesi', 'quadriceps']
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    category: 'legs',
    muscleGroup: 'Hamstring',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '🦵',
    aliases: ['arka bacak makinesi', 'hamstring']
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'legs',
    muscleGroup: 'Hamstring, Kalça',
    equipment: 'Barbell / Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '🏋️',
    aliases: ['rdl']
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
    icon: '🦵',
    aliases: ['bulgar squat', 'split squat']
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    category: 'legs',
    muscleGroup: 'Baldır',
    equipment: 'Makine / Vücut Ağırlığı',
    defaultSets: 4,
    defaultReps: 15,
    icon: '🦶',
    aliases: ['baldır', 'kalf']
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
    icon: '🍑',
    aliases: ['kalça itme']
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🍑',
    aliases: ['kalça köprüsü']
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '🍑',
    aliases: ['kablo geriye tekme', 'kalça tekme']
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
    icon: '',
    aliases: ['oturarak kalça açma', 'oturup yana açma', 'oturarak bacak açma', 'abductor', 'dış kalça', 'yan kalça']
  },
  {
    id: 'cable-abduction',
    name: 'Cable Hip Abduction',
    category: 'glutes',
    muscleGroup: 'Kalça (Yan)',
    equipment: 'Kablo',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['ayakta kalça açma', 'kablo yana açma']
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
    icon: '',
    aliases: ['yan yürüyüş', 'bantlı yürüyüş', 'monster walk']
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

  // GÖĞÜS (ek hareketler)
  {
    id: 'incline-dumbbell-press',
    name: 'Eğimli Dumbbell Press',
    category: 'chest',
    muscleGroup: 'Üst Göğüs, Ön Omuz, Triceps',
    equipment: 'Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['incline dumbbell press', 'üst göğüs']
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    category: 'chest',
    muscleGroup: 'Göğüs, Ön Omuz, Triceps',
    equipment: 'Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['düz dumbbell press', 'flat dumbbell']
  },
  {
    id: 'decline-dumbbell-press',
    name: 'Decline Dumbbell Press',
    category: 'chest',
    muscleGroup: 'Alt Göğüs, Triceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['ters eğimli dumbbell', 'alt göğüs']
  },
  {
    id: 'incline-dumbbell-fly',
    name: 'Eğimli Dumbbell Fly',
    category: 'chest',
    muscleGroup: 'Üst Göğüs',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['incline fly', 'incline dumbbell fly']
  },
  {
    id: 'cable-fly',
    name: 'Cable Fly',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kablo fly', 'cable crossover', 'kablo açış']
  },
  {
    id: 'low-to-high-cable-fly',
    name: 'Alttan Cable Fly (Low to High)',
    category: 'chest',
    muscleGroup: 'Üst Göğüs, Ön Omuz',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['low to high', 'aşağıdan yukarı cable fly', 'üst göğüs cable']
  },
  {
    id: 'high-to-low-cable-fly',
    name: 'Üstten Cable Fly (High to Low)',
    category: 'chest',
    muscleGroup: 'Alt Göğüs',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['high to low', 'yukarıdan aşağı cable fly', 'alt göğüs cable']
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck (Butterfly)',
    category: 'chest',
    muscleGroup: 'Göğüs',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kelebek', 'butterfly', 'pec fly', 'göğüs açma makinesi']
  },
  {
    id: 'incline-machine-press',
    name: 'Eğimli Chest Press Makinesi',
    category: 'chest',
    muscleGroup: 'Üst Göğüs, Triceps',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['incline machine press', 'incline chest press']
  },
  {
    id: 'smith-incline-press',
    name: 'Smith Machine Eğimli Press',
    category: 'chest',
    muscleGroup: 'Üst Göğüs, Ön Omuz',
    equipment: 'Smith Machine',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['smith incline', 'smith bench']
  },
  {
    id: 'dumbbell-pullover',
    name: 'Dumbbell Pullover',
    category: 'chest',
    muscleGroup: 'Göğüs, Kanat (Lat)',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['pullover']
  },
  {
    id: 'incline-push-up',
    name: 'Eğimli Şınav',
    category: 'chest',
    muscleGroup: 'Göğüs, Triceps',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['incline push up', 'kolay şınav']
  },
  {
    id: 'decline-push-up',
    name: 'Ayaklar Yüksekte Şınav',
    category: 'chest',
    muscleGroup: 'Üst Göğüs, Omuz',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['decline push up']
  },

  // SIRT (ek hareketler)
  {
    id: 'chin-up',
    name: 'Chin-Up (Ters Tutuş Barfiks)',
    category: 'back',
    muscleGroup: 'Kanat (Lat), Biceps',
    equipment: 'Barfiks Barı',
    defaultSets: 4,
    defaultReps: 8,
    icon: '',
    aliases: ['chin up', 'ters barfiks']
  },
  {
    id: 'assisted-pull-up',
    name: 'Destekli Barfiks Makinesi',
    category: 'back',
    muscleGroup: 'Kanat (Lat), Biceps',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['assisted pull up', 'yardımlı barfiks']
  },
  {
    id: 'close-grip-pulldown',
    name: 'Dar Tutuş Lat Pulldown',
    category: 'back',
    muscleGroup: 'Kanat (Lat), Orta Sırt',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['v bar pulldown', 'dar pulldown']
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Straight Arm Pulldown',
    category: 'back',
    muscleGroup: 'Kanat (Lat)',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['düz kol pulldown', 'pullover cable']
  },
  {
    id: 'pendlay-row',
    name: 'Pendlay Row',
    category: 'back',
    muscleGroup: 'Orta Sırt, Kanat (Lat)',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 8,
    icon: '',
    aliases: ['patlayıcı row']
  },
  {
    id: 'chest-supported-row',
    name: 'Göğüs Destekli Dumbbell Row',
    category: 'back',
    muscleGroup: 'Orta Sırt, Arka Omuz',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['chest supported row', 'eğimli sehpa row']
  },
  {
    id: 'machine-row',
    name: 'Seated Row Makinesi',
    category: 'back',
    muscleGroup: 'Orta Sırt, Kanat (Lat)',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['makine row', 'oturarak çekiş makinesi']
  },
  {
    id: 'single-arm-cable-row',
    name: 'Tek Kol Cable Row',
    category: 'back',
    muscleGroup: 'Kanat (Lat), Orta Sırt',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['tek kol kablo row']
  },
  {
    id: 'inverted-row',
    name: 'Inverted Row',
    category: 'back',
    muscleGroup: 'Orta Sırt, Biceps',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['ters şınav', 'australian pull up']
  },
  {
    id: 'rack-pull',
    name: 'Rack Pull',
    category: 'back',
    muscleGroup: 'Sırt, Trapez, Kalça',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 6,
    icon: '',
    aliases: ['yarım deadlift']
  },
  {
    id: 'back-extension',
    name: 'Hyperextension (Back Extension)',
    category: 'back',
    muscleGroup: 'Bel, Kalça, Arka Bacak',
    equipment: 'Sehpa',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['hiperekstansiyon', 'bel çalışması', 'back extension']
  },
  {
    id: 'dumbbell-shrug',
    name: 'Dumbbell Shrug',
    category: 'back',
    muscleGroup: 'Trapez',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['omuz silkme', 'trapez']
  },

  // OMUZ (ek hareketler)
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    category: 'shoulders',
    muscleGroup: 'Yan Omuz',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['kablo yana açış', 'tek kol lateral']
  },
  {
    id: 'machine-lateral-raise',
    name: 'Lateral Raise Makinesi',
    category: 'shoulders',
    muscleGroup: 'Yan Omuz',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['makine yana açış']
  },
  {
    id: 'machine-shoulder-press',
    name: 'Shoulder Press Makinesi',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz, Yan Omuz, Triceps',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['omuz press makinesi']
  },
  {
    id: 'reverse-pec-deck',
    name: 'Reverse Pec Deck',
    category: 'shoulders',
    muscleGroup: 'Arka Omuz, Orta Sırt',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['ters kelebek', 'arka omuz makinesi', 'reverse fly']
  },
  {
    id: 'cable-rear-delt-fly',
    name: 'Cable Rear Delt Fly',
    category: 'shoulders',
    muscleGroup: 'Arka Omuz',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['kablo arka omuz']
  },
  {
    id: 'landmine-press',
    name: 'Landmine Press',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz, Üst Göğüs',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['landmine']
  },
  {
    id: 'push-press',
    name: 'Push Press',
    category: 'shoulders',
    muscleGroup: 'Omuz, Triceps, Bacak',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 6,
    icon: '',
    aliases: ['itişli press']
  },
  {
    id: 'seated-dumbbell-press',
    name: 'Oturarak Dumbbell Omuz Press',
    category: 'shoulders',
    muscleGroup: 'Ön Omuz, Yan Omuz, Triceps',
    equipment: 'Dumbbell',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['seated dumbbell press']
  },
  {
    id: 'lean-away-lateral-raise',
    name: 'Tek Kol Yaslanarak Lateral Raise',
    category: 'shoulders',
    muscleGroup: 'Yan Omuz',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['lean away lateral']
  },

  // BICEPS (ek hareketler)
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    category: 'biceps',
    muscleGroup: 'Biceps (Uzun Baş)',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['eğimli dumbbell curl', 'incline curl', 'eğimli sehpada curl']
  },
  {
    id: 'ez-bar-curl',
    name: 'EZ Bar Curl',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'EZ Bar',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['ez curl', 'zigzag bar curl']
  },
  {
    id: 'spider-curl',
    name: 'Spider Curl',
    category: 'biceps',
    muscleGroup: 'Biceps (Kısa Baş)',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['örümcek curl']
  },
  {
    id: 'bayesian-curl',
    name: 'Bayesian Cable Curl',
    category: 'biceps',
    muscleGroup: 'Biceps (Uzun Baş)',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['arkadan kablo curl']
  },
  {
    id: 'reverse-curl',
    name: 'Reverse Curl',
    category: 'biceps',
    muscleGroup: 'Ön Kol, Brachialis',
    equipment: 'EZ Bar',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['ters tutuş curl', 'ön kol']
  },
  {
    id: 'rope-hammer-curl',
    name: 'Rope Hammer Curl',
    category: 'biceps',
    muscleGroup: 'Brachialis, Ön Kol',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['halat hammer curl', 'kablo hammer']
  },
  {
    id: 'machine-preacher-curl',
    name: 'Preacher Curl Makinesi',
    category: 'biceps',
    muscleGroup: 'Biceps',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['scott curl makinesi', 'makine curl']
  },
  {
    id: 'zottman-curl',
    name: 'Zottman Curl',
    category: 'biceps',
    muscleGroup: 'Biceps, Ön Kol',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['zottman']
  },
  {
    id: 'cross-body-hammer-curl',
    name: 'Çapraz Hammer Curl',
    category: 'biceps',
    muscleGroup: 'Brachialis, Biceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['cross body hammer']
  },
  {
    id: 'wrist-curl',
    name: 'Bilek Curl',
    category: 'biceps',
    muscleGroup: 'Ön Kol',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['wrist curl', 'ön kol', 'bilek']
  },

  // TRICEPS (ek hareketler)
  {
    id: 'rope-pushdown',
    name: 'Rope Pushdown',
    category: 'triceps',
    muscleGroup: 'Triceps (Yan Baş)',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['halat pushdown', 'ip pushdown']
  },
  {
    id: 'cable-overhead-extension',
    name: 'Cable Overhead Tricep Extension',
    category: 'triceps',
    muscleGroup: 'Triceps (Uzun Baş)',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kablo baş üstü triceps', 'overhead rope']
  },
  {
    id: 'single-arm-pushdown',
    name: 'Tek Kol Cable Pushdown',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['tek kol pushdown']
  },
  {
    id: 'jm-press',
    name: 'JM Press',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 8,
    icon: '',
    aliases: ['jm']
  },
  {
    id: 'dip-machine',
    name: 'Dip Makinesi',
    category: 'triceps',
    muscleGroup: 'Triceps, Alt Göğüs',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['oturarak dip', 'assisted dip']
  },
  {
    id: 'diamond-push-up',
    name: 'Diamond Şınav',
    category: 'triceps',
    muscleGroup: 'Triceps, Göğüs',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['elmas şınav', 'dar şınav']
  },
  {
    id: 'dumbbell-skull-crusher',
    name: 'Dumbbell Skull Crusher',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['dumbbell french press', 'yatarak triceps']
  },
  {
    id: 'bench-dip',
    name: 'Bench Dip',
    category: 'triceps',
    muscleGroup: 'Triceps',
    equipment: 'Sehpa',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['sehpa dip', 'sandalye dip']
  },

  // BACAK (ek hareketler)
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak, Kalça',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kadeh squat']
  },
  {
    id: 'smith-squat',
    name: 'Smith Machine Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak, Kalça',
    equipment: 'Smith Machine',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['smith squat']
  },
  {
    id: 'pendulum-squat',
    name: 'Pendulum Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['sarkaç squat']
  },
  {
    id: 'belt-squat',
    name: 'Belt Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak, Kalça',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['kemer squat']
  },
  {
    id: 'walking-lunge',
    name: 'Walking Lunge',
    category: 'legs',
    muscleGroup: 'Ön Bacak, Kalça',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['yürüyerek lunge', 'yürüme hamlesi']
  },
  {
    id: 'seated-leg-curl',
    name: 'Oturarak Leg Curl',
    category: 'legs',
    muscleGroup: 'Arka Bacak (Hamstring)',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['seated leg curl', 'arka bacak makinesi']
  },
  {
    id: 'lying-leg-curl',
    name: 'Yatarak Leg Curl',
    category: 'legs',
    muscleGroup: 'Arka Bacak (Hamstring)',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['lying leg curl', 'arka bacak makinesi']
  },
  {
    id: 'nordic-curl',
    name: 'Nordic Hamstring Curl',
    category: 'legs',
    muscleGroup: 'Arka Bacak (Hamstring)',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 6,
    icon: '',
    aliases: ['nordic', 'nordik']
  },
  {
    id: 'stiff-leg-deadlift',
    name: 'Stiff Leg Deadlift',
    category: 'legs',
    muscleGroup: 'Arka Bacak, Kalça, Bel',
    equipment: 'Barbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['düz bacak deadlift', 'sldl']
  },
  {
    id: 'sissy-squat',
    name: 'Sissy Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['sissy']
  },
  {
    id: 'seated-calf-raise',
    name: 'Oturarak Calf Raise',
    category: 'legs',
    muscleGroup: 'Baldır (Soleus)',
    equipment: 'Makine',
    defaultSets: 4,
    defaultReps: 15,
    icon: '',
    aliases: ['oturarak baldır', 'seated calf']
  },
  {
    id: 'leg-press-calf-raise',
    name: 'Leg Press Calf Raise',
    category: 'legs',
    muscleGroup: 'Baldır',
    equipment: 'Makine',
    defaultSets: 4,
    defaultReps: 15,
    icon: '',
    aliases: ['leg presste baldır']
  },
  {
    id: 'hip-adduction-machine',
    name: 'Hip Adduction Makinesi',
    category: 'legs',
    muscleGroup: 'İç Bacak (Adductor)',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['oturarak bacak kapama', 'iç bacak', 'adductor', 'bacak kapatma']
  },
  {
    id: 'glute-ham-raise',
    name: 'Glute Ham Raise',
    category: 'legs',
    muscleGroup: 'Arka Bacak, Kalça',
    equipment: 'GHD Sehpası',
    defaultSets: 3,
    defaultReps: 8,
    icon: '',
    aliases: ['ghr', 'ghd']
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    category: 'legs',
    muscleGroup: 'Ön Bacak',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 45,
    icon: '',
    aliases: ['duvar oturuşu', 'duvarda oturma']
  },
  {
    id: 'box-squat',
    name: 'Box Squat',
    category: 'legs',
    muscleGroup: 'Ön Bacak, Kalça',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 8,
    icon: '',
    aliases: ['kutu squat']
  },

  // KALÇA (ek hareketler)
  {
    id: 'seated-band-abduction',
    name: 'Bantlı Oturarak Kalça Açma',
    category: 'glutes',
    muscleGroup: 'Yan Kalça (Gluteus Medius)',
    equipment: 'Mini Band',
    defaultSets: 3,
    defaultReps: 20,
    icon: '',
    aliases: ['oturup yana açma', 'oturarak bacak açma', 'band abduction', 'abductor bant']
  },
  {
    id: 'clamshell',
    name: 'Clamshell (İstiridye)',
    category: 'glutes',
    muscleGroup: 'Yan Kalça (Gluteus Medius)',
    equipment: 'Mini Band',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['istiridye', 'yan yatarak diz açma']
  },
  {
    id: 'side-lying-leg-raise',
    name: 'Yan Yatarak Bacak Kaldırma',
    category: 'glutes',
    muscleGroup: 'Yan Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['side lying abduction', 'yana bacak kaldırma']
  },
  {
    id: 'fire-hydrant',
    name: 'Fire Hydrant',
    category: 'glutes',
    muscleGroup: 'Yan Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['köpek bacak açma', 'dört ayak yana açma']
  },
  {
    id: 'donkey-kick',
    name: 'Donkey Kick',
    category: 'glutes',
    muscleGroup: 'Kalça (Gluteus Maximus)',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['eşek tekmesi', 'dört ayak geriye tekme']
  },
  {
    id: 'glute-kickback-machine',
    name: 'Glute Kickback Makinesi',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kalça tekme makinesi', 'geriye tekme makinesi']
  },
  {
    id: 'smith-hip-thrust',
    name: 'Smith Machine Hip Thrust',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Smith Machine',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['smith hip thrust']
  },
  {
    id: 'hip-thrust-machine',
    name: 'Hip Thrust Makinesi',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Makine',
    defaultSets: 4,
    defaultReps: 10,
    icon: '',
    aliases: ['glute drive', 'kalça itme makinesi']
  },
  {
    id: 'single-leg-hip-thrust',
    name: 'Tek Bacak Hip Thrust',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['tek bacak kalça köprüsü']
  },
  {
    id: 'cable-pull-through',
    name: 'Cable Pull Through',
    category: 'glutes',
    muscleGroup: 'Kalça, Arka Bacak',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['pull through']
  },
  {
    id: 'reverse-hyperextension',
    name: 'Reverse Hyperextension',
    category: 'glutes',
    muscleGroup: 'Kalça, Bel',
    equipment: 'Makine',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['ters hiperekstansiyon']
  },
  {
    id: 'kas-glute-bridge',
    name: 'Barbell Glute Bridge',
    category: 'glutes',
    muscleGroup: 'Kalça',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 12,
    icon: '',
    aliases: ['ağırlıklı kalça köprüsü']
  },
  {
    id: 'deficit-reverse-lunge',
    name: 'Deficit Reverse Lunge',
    category: 'glutes',
    muscleGroup: 'Kalça, Ön Bacak',
    equipment: 'Dumbbell',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['yükseltilmiş geri lunge']
  },
  {
    id: 'cable-glute-kickback-standing',
    name: 'Ayakta Cable Kalça Açma',
    category: 'glutes',
    muscleGroup: 'Yan Kalça',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['ayakta yana açma', 'kablo yana açma']
  },

  // KARIN (ek hareketler)
  {
    id: 'side-plank',
    name: 'Yan Plank (Side Plank)',
    category: 'core',
    muscleGroup: 'Yan Karın (Oblik)',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 30,
    icon: '',
    aliases: ['side plank', 'yan köprü']
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    category: 'core',
    muscleGroup: 'Karın, Oblik',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 20,
    icon: '',
    aliases: ['bisiklet mekik']
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    muscleGroup: 'Derin Karın',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['ölü böcek']
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    category: 'core',
    muscleGroup: 'Karın, Oblik',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['anti rotasyon']
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    category: 'core',
    muscleGroup: 'Karın',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 30,
    icon: '',
    aliases: ['hollow body']
  },
  {
    id: 'decline-sit-up',
    name: 'Decline Sit-Up',
    category: 'core',
    muscleGroup: 'Karın',
    equipment: 'Sehpa',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['eğimli mekik', 'sit up']
  },
  {
    id: 'cable-woodchopper',
    name: 'Cable Woodchopper',
    category: 'core',
    muscleGroup: 'Oblik, Karın',
    equipment: 'Cable',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['odun kesme', 'woodchop']
  },
  {
    id: 'toes-to-bar',
    name: 'Toes to Bar',
    category: 'core',
    muscleGroup: 'Karın, Kalça Fleksörleri',
    equipment: 'Barfiks Barı',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['ayak bara']
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse Crunch',
    category: 'core',
    muscleGroup: 'Alt Karın',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 15,
    icon: '',
    aliases: ['ters mekik', 'alt karın']
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'core',
    muscleGroup: 'Karın, Bel',
    equipment: 'Vücut Ağırlığı',
    defaultSets: 3,
    defaultReps: 12,
    icon: '',
    aliases: ['kuş köpek']
  },

  // KARDİYO (ek hareketler)
  {
    id: 'box-jump',
    name: 'Box Jump',
    category: 'cardio',
    muscleGroup: 'Bacak, Kalça',
    equipment: 'Kutu',
    defaultSets: 3,
    defaultReps: 10,
    icon: '',
    aliases: ['kutu atlama']
  },
  {
    id: 'battle-rope',
    name: 'Battle Rope',
    category: 'cardio',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Halat',
    defaultSets: 4,
    defaultReps: 30,
    icon: '',
    aliases: ['savaş halatı', 'halat']
  },
  {
    id: 'sled-push',
    name: 'Sled Push',
    category: 'cardio',
    muscleGroup: 'Bacak, Kalça',
    equipment: 'Kızak',
    defaultSets: 4,
    defaultReps: 20,
    icon: '',
    aliases: ['kızak itme', 'prowler']
  },

  // ÇOKLU KAS (ek hareketler)
  {
    id: 'trap-bar-deadlift',
    name: 'Trap Bar Deadlift',
    category: 'compound',
    muscleGroup: 'Bacak, Kalça, Sırt',
    equipment: 'Trap Bar',
    defaultSets: 4,
    defaultReps: 6,
    icon: '',
    aliases: ['hex bar deadlift', 'altıgen bar']
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    category: 'compound',
    muscleGroup: 'Kalça, İç Bacak, Sırt',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultReps: 6,
    icon: '',
    aliases: ['sumo']
  },
  {
    id: 'power-clean',
    name: 'Power Clean',
    category: 'compound',
    muscleGroup: 'Tüm Vücut',
    equipment: 'Barbell',
    defaultSets: 5,
    defaultReps: 3,
    icon: '',
    aliases: ['clean']
  },
  {
    id: 'turkish-get-up',
    name: 'Turkish Get-Up',
    category: 'compound',
    muscleGroup: 'Tüm Vücut, Omuz, Karın',
    equipment: 'Kettlebell',
    defaultSets: 3,
    defaultReps: 3,
    icon: '',
    aliases: ['türk kalkışı']
  },
];

// Egzersiz arama fonksiyonu
export function searchExercises(query: string): ExerciseItem[] {
  if (!query.trim()) return [];
  const category = (id: string) => exerciseCategories.find((c) => c.id === id)?.name ?? '';
  return exerciseDatabase
    .map((e) => ({ e, score: foodMatchScore(query, e.name, [e.muscleGroup, e.equipment, category(e.category), ...(e.aliases ?? [])]) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name, 'tr'))
    .map((r) => r.e);
}

// Kategoriye göre egzersizleri getir
export function getExercisesByCategory(categoryId: string): ExerciseItem[] {
  return exerciseDatabase.filter(exercise => exercise.category === categoryId);
}

// ID'ye göre egzersiz getir
export function getExerciseById(id: string): ExerciseItem | undefined {
  return exerciseDatabase.find(exercise => exercise.id === id);
}

