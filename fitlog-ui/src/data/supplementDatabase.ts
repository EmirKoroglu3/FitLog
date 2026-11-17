// Takviye veritabanı
export interface SupplementItem {
  id: string;
  name: string;
  category: string;
  defaultDosage: string;
  timing: string[];
  benefits: string;
  icon: string;
  /** Typical label values for one serving (defaultDosage); user can adjust to their product. */
  nutrition?: { calories: number; protein: number; carbohydrates: number; fat: number };
}

export const supplementCategories = [
  { id: 'protein', name: 'Protein', icon: '💪' },
  { id: 'performance', name: 'Performans', icon: '⚡' },
  { id: 'vitamin', name: 'Vitaminler', icon: '🌟' },
  { id: 'mineral', name: 'Mineraller', icon: '🔬' },
  { id: 'amino', name: 'Amino Asitler', icon: '🧬' },
  { id: 'omega', name: 'Yağ Asitleri', icon: '🐟' },
  { id: 'herbal', name: 'Bitkisel', icon: '🌿' },
  { id: 'other', name: 'Diğer', icon: '💊' },
];

export const supplementDatabase: SupplementItem[] = [
  // PROTEIN
  {
    id: 'whey-protein',
    name: 'Whey Protein',
    category: 'protein',
    defaultDosage: '1 ölçek (30g)',
    timing: ['Antrenman Sonrası', 'Sabah', 'Ara Öğün'],
    benefits: 'Kas gelişimi, toparlanma',
    icon: '🥛',
    nutrition: { calories: 120, protein: 24, carbohydrates: 3, fat: 1.5 }
  },
  {
    id: 'whey-isolate',
    name: 'Whey Protein İzolat',
    category: 'protein',
    defaultDosage: '1 ölçek (30g)',
    timing: ['Antrenman Sonrası', 'Sabah'],
    benefits: 'Hızlı emilim, düşük yağ',
    icon: '🥛',
    nutrition: { calories: 110, protein: 27, carbohydrates: 1, fat: 0.5 }
  },
  {
    id: 'casein',
    name: 'Kazein Protein',
    category: 'protein',
    defaultDosage: '1 ölçek (30g)',
    timing: ['Yatmadan Önce'],
    benefits: 'Yavaş salınım, gece toparlanma',
    icon: '🌙',
    nutrition: { calories: 115, protein: 24, carbohydrates: 3, fat: 1 }
  },
  {
    id: 'mass-gainer',
    name: 'Mass Gainer',
    category: 'protein',
    defaultDosage: '1 ölçek (100g)',
    timing: ['Antrenman Sonrası', 'Ara Öğün'],
    benefits: 'Kilo alma, kalori artışı',
    icon: '💪',
    nutrition: { calories: 380, protein: 15, carbohydrates: 75, fat: 3 }
  },
  {
    id: 'plant-protein',
    name: 'Bitkisel Protein',
    category: 'protein',
    defaultDosage: '1 ölçek (30g)',
    timing: ['Antrenman Sonrası', 'Ara Öğün'],
    benefits: 'Vegan seçenek',
    icon: '🌱',
    nutrition: { calories: 115, protein: 21, carbohydrates: 4, fat: 2 }
  },

  // PERFORMANS
  {
    id: 'creatine',
    name: 'Kreatin Monohidrat',
    category: 'performance',
    defaultDosage: '5g',
    timing: ['Antrenman Sonrası', 'Sabah'],
    benefits: 'Güç, kas hacmi, performans',
    icon: '⚡'
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout',
    category: 'performance',
    defaultDosage: '1 ölçek',
    timing: ['Antrenman Öncesi'],
    benefits: 'Enerji, odaklanma, pompa',
    icon: '🔥'
  },
  {
    id: 'caffeine',
    name: 'Kafein',
    category: 'performance',
    defaultDosage: '200mg',
    timing: ['Antrenman Öncesi', 'Sabah'],
    benefits: 'Enerji, odaklanma',
    icon: '☕'
  },
  {
    id: 'beta-alanine',
    name: 'Beta-Alanin',
    category: 'performance',
    defaultDosage: '3-5g',
    timing: ['Antrenman Öncesi'],
    benefits: 'Dayanıklılık, yorgunluk azaltma',
    icon: '🏃'
  },
  {
    id: 'citrulline',
    name: 'L-Sitrülin',
    category: 'performance',
    defaultDosage: '6-8g',
    timing: ['Antrenman Öncesi'],
    benefits: 'Kan akışı, pompa',
    icon: '💉'
  },

  // VİTAMİNLER
  {
    id: 'vitamin-d3',
    name: 'D3 Vitamini',
    category: 'vitamin',
    defaultDosage: '1000-5000 IU',
    timing: ['Sabah', 'Öğle'],
    benefits: 'Kemik sağlığı, bağışıklık',
    icon: '☀️'
  },
  {
    id: 'vitamin-c',
    name: 'C Vitamini',
    category: 'vitamin',
    defaultDosage: '500-1000mg',
    timing: ['Sabah', 'Öğle'],
    benefits: 'Bağışıklık, antioksidan',
    icon: '🍊'
  },
  {
    id: 'vitamin-b-complex',
    name: 'B Vitamini Kompleks',
    category: 'vitamin',
    defaultDosage: '1 tablet',
    timing: ['Sabah'],
    benefits: 'Enerji metabolizması',
    icon: '⚡'
  },
  {
    id: 'vitamin-e',
    name: 'E Vitamini',
    category: 'vitamin',
    defaultDosage: '400 IU',
    timing: ['Sabah'],
    benefits: 'Antioksidan, cilt sağlığı',
    icon: '🌟'
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    category: 'vitamin',
    defaultDosage: '1 tablet',
    timing: ['Sabah'],
    benefits: 'Genel sağlık desteği',
    icon: '💊'
  },

  // MİNERALLER
  {
    id: 'zinc',
    name: 'Çinko',
    category: 'mineral',
    defaultDosage: '15-30mg',
    timing: ['Yatmadan Önce'],
    benefits: 'Bağışıklık, hormon dengesi',
    icon: '🔬'
  },
  {
    id: 'magnesium',
    name: 'Magnezyum',
    category: 'mineral',
    defaultDosage: '200-400mg',
    timing: ['Yatmadan Önce'],
    benefits: 'Kas gevşemesi, uyku',
    icon: '💤'
  },
  {
    id: 'calcium',
    name: 'Kalsiyum',
    category: 'mineral',
    defaultDosage: '500-1000mg',
    timing: ['Sabah', 'Akşam'],
    benefits: 'Kemik sağlığı',
    icon: '🦴'
  },
  {
    id: 'iron',
    name: 'Demir',
    category: 'mineral',
    defaultDosage: '18-27mg',
    timing: ['Sabah'],
    benefits: 'Kan yapımı, enerji',
    icon: '🩸'
  },
  {
    id: 'zma',
    name: 'ZMA',
    category: 'mineral',
    defaultDosage: '1-2 kapsül',
    timing: ['Yatmadan Önce'],
    benefits: 'Toparlanma, uyku kalitesi',
    icon: '💤'
  },

  // AMİNO ASİTLER
  {
    id: 'bcaa',
    name: 'BCAA',
    category: 'amino',
    defaultDosage: '5-10g',
    timing: ['Antrenman Öncesi', 'Antrenman Sırası', 'Antrenman Sonrası'],
    benefits: 'Kas koruması, toparlanma',
    icon: '🧬'
  },
  {
    id: 'eaa',
    name: 'EAA',
    category: 'amino',
    defaultDosage: '10-15g',
    timing: ['Antrenman Sırası', 'Antrenman Sonrası'],
    benefits: 'Tam amino profili',
    icon: '🧬'
  },
  {
    id: 'glutamine',
    name: 'L-Glutamin',
    category: 'amino',
    defaultDosage: '5-10g',
    timing: ['Antrenman Sonrası', 'Yatmadan Önce'],
    benefits: 'Bağışıklık, toparlanma',
    icon: '🛡️'
  },
  {
    id: 'arginine',
    name: 'L-Arginin',
    category: 'amino',
    defaultDosage: '3-5g',
    timing: ['Antrenman Öncesi'],
    benefits: 'Kan akışı, NO üretimi',
    icon: '💉'
  },
  {
    id: 'taurine',
    name: 'Taurin',
    category: 'amino',
    defaultDosage: '1-3g',
    timing: ['Antrenman Öncesi'],
    benefits: 'Hidrasyon, performans',
    icon: '💧'
  },

  // YAĞ ASİTLERİ
  {
    id: 'omega-3',
    name: 'Omega-3 Balık Yağı',
    category: 'omega',
    defaultDosage: '1-3g',
    timing: ['Sabah', 'Akşam'],
    benefits: 'Kalp sağlığı, inflamasyon',
    icon: '🐟'
  },
  {
    id: 'fish-oil',
    name: 'Balık Yağı',
    category: 'omega',
    defaultDosage: '1000-3000mg',
    timing: ['Sabah', 'Akşam'],
    benefits: 'Genel sağlık',
    icon: '🐟'
  },
  {
    id: 'cla',
    name: 'CLA',
    category: 'omega',
    defaultDosage: '3-4g',
    timing: ['Sabah', 'Öğle', 'Akşam'],
    benefits: 'Yağ yakımı desteği',
    icon: '🔥'
  },

  // BİTKİSEL
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    category: 'herbal',
    defaultDosage: '300-600mg',
    timing: ['Sabah', 'Yatmadan Önce'],
    benefits: 'Stres azaltma, toparlanma',
    icon: '🌿'
  },
  {
    id: 'ginseng',
    name: 'Ginseng',
    category: 'herbal',
    defaultDosage: '200-400mg',
    timing: ['Sabah'],
    benefits: 'Enerji, odaklanma',
    icon: '🌿'
  },
  {
    id: 'tribulus',
    name: 'Tribulus Terrestris',
    category: 'herbal',
    defaultDosage: '500-750mg',
    timing: ['Sabah', 'Akşam'],
    benefits: 'Libido, enerji',
    icon: '🌿'
  },
  {
    id: 'green-tea-extract',
    name: 'Yeşil Çay Ekstresi',
    category: 'herbal',
    defaultDosage: '250-500mg',
    timing: ['Sabah', 'Öğle'],
    benefits: 'Metabolizma, antioksidan',
    icon: '🍵'
  },

  // DİĞER
  {
    id: 'melatonin',
    name: 'Melatonin',
    category: 'other',
    defaultDosage: '1-5mg',
    timing: ['Yatmadan Önce'],
    benefits: 'Uyku düzeni',
    icon: '🌙'
  },
  {
    id: 'collagen',
    name: 'Kolajen',
    category: 'other',
    defaultDosage: '10g',
    timing: ['Sabah', 'Akşam'],
    benefits: 'Eklem, cilt sağlığı',
    icon: '✨',
    nutrition: { calories: 36, protein: 9, carbohydrates: 0, fat: 0 }
  },
  {
    id: 'probiotics',
    name: 'Probiyotik',
    category: 'other',
    defaultDosage: '1 kapsül',
    timing: ['Sabah'],
    benefits: 'Bağırsak sağlığı',
    icon: '🦠'
  },
  {
    id: 'digestive-enzyme',
    name: 'Sindirim Enzimi',
    category: 'other',
    defaultDosage: '1 kapsül',
    timing: ['Yemeklerle'],
    benefits: 'Sindirim desteği',
    icon: '🍽️'
  },
  {
    id: 'l-carnitine',
    name: 'L-Karnitin',
    category: 'other',
    defaultDosage: '1-2g',
    timing: ['Antrenman Öncesi', 'Sabah'],
    benefits: 'Yağ yakımı, enerji',
    icon: '🔥'
  },
];

// Takviye arama fonksiyonu
export function searchSupplements(query: string): SupplementItem[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  return supplementDatabase.filter(supp => 
    supp.name.toLowerCase().includes(lowerQuery) ||
    supp.benefits.toLowerCase().includes(lowerQuery)
  );
}

// Kategoriye göre takviyeleri getir
export function getSupplementsByCategory(categoryId: string): SupplementItem[] {
  return supplementDatabase.filter(supp => supp.category === categoryId);
}

// ID'ye göre takviye getir
export function getSupplementById(id: string): SupplementItem | undefined {
  return supplementDatabase.find(supp => supp.id === id);
}

