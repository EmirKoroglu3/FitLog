// Yiyecek veritabanı - 100 gram başına besin değerleri
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number; // gram veya adet
  servingUnit: string; // 'g', 'adet', 'dilim', 'bardak', 'kase'
  calories: number; // porsiyon başına
  protein: number;
  carbohydrates: number;
  fat: number;
  icon: string;
}

export const foodCategories = [
  { id: 'protein', name: 'Protein Kaynakları', icon: '🥩' },
  { id: 'dairy', name: 'Süt Ürünleri', icon: '🥛' },
  { id: 'grains', name: 'Tahıllar & Ekmek', icon: '🍞' },
  { id: 'vegetables', name: 'Sebzeler', icon: '🥗' },
  { id: 'fruits', name: 'Meyveler', icon: '🍎' },
  { id: 'snacks', name: 'Atıştırmalıklar', icon: '🥜' },
  { id: 'drinks', name: 'İçecekler', icon: '🥤' },
  { id: 'meals', name: 'Hazır Yemekler', icon: '🍲' },
];

export const foodDatabase: FoodItem[] = [
  // PROTEIN KAYNAKLARI
  {
    id: 'egg-boiled',
    name: 'Haşlanmış Yumurta',
    category: 'protein',
    servingSize: 1,
    servingUnit: 'adet (60g)',
    calories: 78,
    protein: 6.3,
    carbohydrates: 0.6,
    fat: 5.3,
    icon: '🥚'
  },
  {
    id: 'egg-fried',
    name: 'Sahanda Yumurta',
    category: 'protein',
    servingSize: 1,
    servingUnit: 'adet',
    calories: 110,
    protein: 6.3,
    carbohydrates: 0.6,
    fat: 9,
    icon: '🍳'
  },
  {
    id: 'chicken-breast',
    name: 'Tavuk Göğsü (Izgara)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    icon: '🍗'
  },
  {
    id: 'chicken-thigh',
    name: 'Tavuk But (Izgara)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 209,
    protein: 26,
    carbohydrates: 0,
    fat: 10.9,
    icon: '🍗'
  },
  {
    id: 'beef-lean',
    name: 'Kırmızı Et (Yağsız)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 250,
    protein: 26,
    carbohydrates: 0,
    fat: 15,
    icon: '🥩'
  },
  {
    id: 'beef-minced',
    name: 'Kıyma (Orta Yağlı)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 332,
    protein: 14,
    carbohydrates: 0,
    fat: 30,
    icon: '🥩'
  },
  {
    id: 'fish-salmon',
    name: 'Somon (Izgara)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 208,
    protein: 20,
    carbohydrates: 0,
    fat: 13,
    icon: '🐟'
  },
  {
    id: 'fish-seabass',
    name: 'Levrek (Izgara)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 124,
    protein: 23.6,
    carbohydrates: 0,
    fat: 2.6,
    icon: '🐟'
  },
  {
    id: 'tuna-canned',
    name: 'Ton Balığı (Konserve)',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 116,
    protein: 25.5,
    carbohydrates: 0,
    fat: 0.8,
    icon: '🐟'
  },
  {
    id: 'shrimp',
    name: 'Karides',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    calories: 99,
    protein: 24,
    carbohydrates: 0.2,
    fat: 0.3,
    icon: '🦐'
  },

  // SÜT ÜRÜNLERİ
  {
    id: 'milk-whole',
    name: 'Tam Yağlı Süt',
    category: 'dairy',
    servingSize: 200,
    servingUnit: 'ml (1 bardak)',
    calories: 122,
    protein: 6.4,
    carbohydrates: 9.4,
    fat: 6.6,
    icon: '🥛'
  },
  {
    id: 'milk-semi',
    name: 'Yarım Yağlı Süt',
    category: 'dairy',
    servingSize: 200,
    servingUnit: 'ml (1 bardak)',
    calories: 92,
    protein: 6.4,
    carbohydrates: 9.6,
    fat: 3.2,
    icon: '🥛'
  },
  {
    id: 'yogurt-plain',
    name: 'Yoğurt (Tam Yağlı)',
    category: 'dairy',
    servingSize: 200,
    servingUnit: 'g (1 kase)',
    calories: 122,
    protein: 7,
    carbohydrates: 9.4,
    fat: 6.6,
    icon: '🥛'
  },
  {
    id: 'yogurt-greek',
    name: 'Süzme Yoğurt',
    category: 'dairy',
    servingSize: 150,
    servingUnit: 'g (1 kase)',
    calories: 147,
    protein: 15,
    carbohydrates: 6,
    fat: 7.5,
    icon: '🥛'
  },
  {
    id: 'cheese-white',
    name: 'Beyaz Peynir',
    category: 'dairy',
    servingSize: 30,
    servingUnit: 'g (1 dilim)',
    calories: 80,
    protein: 5.3,
    carbohydrates: 0.4,
    fat: 6.3,
    icon: '🧀'
  },
  {
    id: 'cheese-kasar',
    name: 'Kaşar Peyniri',
    category: 'dairy',
    servingSize: 30,
    servingUnit: 'g (1 dilim)',
    calories: 110,
    protein: 7.5,
    carbohydrates: 0.3,
    fat: 9,
    icon: '🧀'
  },
  {
    id: 'cheese-cottage',
    name: 'Lor Peyniri',
    category: 'dairy',
    servingSize: 100,
    servingUnit: 'g',
    calories: 98,
    protein: 11,
    carbohydrates: 3.4,
    fat: 4.3,
    icon: '🧀'
  },

  // TAHILLAR & EKMEK
  {
    id: 'bread-white',
    name: 'Beyaz Ekmek',
    category: 'grains',
    servingSize: 1,
    servingUnit: 'dilim (30g)',
    calories: 79,
    protein: 2.7,
    carbohydrates: 15,
    fat: 0.9,
    icon: '🍞'
  },
  {
    id: 'bread-whole',
    name: 'Tam Buğday Ekmek',
    category: 'grains',
    servingSize: 1,
    servingUnit: 'dilim (30g)',
    calories: 69,
    protein: 3.5,
    carbohydrates: 12,
    fat: 1.1,
    icon: '🍞'
  },
  {
    id: 'rice-cooked',
    name: 'Pilav (Pirinç)',
    category: 'grains',
    servingSize: 150,
    servingUnit: 'g (1 porsiyon)',
    calories: 195,
    protein: 4.1,
    carbohydrates: 42,
    fat: 0.5,
    icon: '🍚'
  },
  {
    id: 'bulgur-cooked',
    name: 'Bulgur Pilavı',
    category: 'grains',
    servingSize: 150,
    servingUnit: 'g (1 porsiyon)',
    calories: 170,
    protein: 5.5,
    carbohydrates: 35,
    fat: 0.8,
    icon: '🍚'
  },
  {
    id: 'pasta-cooked',
    name: 'Makarna',
    category: 'grains',
    servingSize: 200,
    servingUnit: 'g (1 porsiyon)',
    calories: 262,
    protein: 9.4,
    carbohydrates: 50,
    fat: 1.6,
    icon: '🍝'
  },
  {
    id: 'oats',
    name: 'Yulaf Ezmesi',
    category: 'grains',
    servingSize: 40,
    servingUnit: 'g',
    calories: 156,
    protein: 5.3,
    carbohydrates: 27,
    fat: 2.8,
    icon: '🥣'
  },
  {
    id: 'corn-flakes',
    name: 'Mısır Gevreği',
    category: 'grains',
    servingSize: 30,
    servingUnit: 'g',
    calories: 112,
    protein: 2.1,
    carbohydrates: 25,
    fat: 0.3,
    icon: '🥣'
  },

  // SEBZELER
  {
    id: 'tomato',
    name: 'Domates',
    category: 'vegetables',
    servingSize: 1,
    servingUnit: 'adet (120g)',
    calories: 22,
    protein: 1.1,
    carbohydrates: 4.8,
    fat: 0.2,
    icon: '🍅'
  },
  {
    id: 'cucumber',
    name: 'Salatalık',
    category: 'vegetables',
    servingSize: 1,
    servingUnit: 'adet (150g)',
    calories: 24,
    protein: 1,
    carbohydrates: 5.5,
    fat: 0.2,
    icon: '🥒'
  },
  {
    id: 'salad-mixed',
    name: 'Karışık Salata',
    category: 'vegetables',
    servingSize: 150,
    servingUnit: 'g (1 porsiyon)',
    calories: 25,
    protein: 1.5,
    carbohydrates: 4,
    fat: 0.3,
    icon: '🥗'
  },
  {
    id: 'broccoli',
    name: 'Brokoli (Haşlanmış)',
    category: 'vegetables',
    servingSize: 100,
    servingUnit: 'g',
    calories: 35,
    protein: 2.4,
    carbohydrates: 7,
    fat: 0.4,
    icon: '🥦'
  },
  {
    id: 'spinach',
    name: 'Ispanak (Pişmiş)',
    category: 'vegetables',
    servingSize: 100,
    servingUnit: 'g',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fat: 0.4,
    icon: '🥬'
  },
  {
    id: 'potato-boiled',
    name: 'Patates (Haşlanmış)',
    category: 'vegetables',
    servingSize: 150,
    servingUnit: 'g (1 adet)',
    calories: 130,
    protein: 2.7,
    carbohydrates: 30,
    fat: 0.2,
    icon: '🥔'
  },
  {
    id: 'carrot',
    name: 'Havuç',
    category: 'vegetables',
    servingSize: 1,
    servingUnit: 'adet (80g)',
    calories: 33,
    protein: 0.7,
    carbohydrates: 7.7,
    fat: 0.2,
    icon: '🥕'
  },

  // MEYVELER
  {
    id: 'apple',
    name: 'Elma',
    category: 'fruits',
    servingSize: 1,
    servingUnit: 'adet (180g)',
    calories: 95,
    protein: 0.5,
    carbohydrates: 25,
    fat: 0.3,
    icon: '🍎'
  },
  {
    id: 'banana',
    name: 'Muz',
    category: 'fruits',
    servingSize: 1,
    servingUnit: 'adet (120g)',
    calories: 105,
    protein: 1.3,
    carbohydrates: 27,
    fat: 0.4,
    icon: '🍌'
  },
  {
    id: 'orange',
    name: 'Portakal',
    category: 'fruits',
    servingSize: 1,
    servingUnit: 'adet (150g)',
    calories: 62,
    protein: 1.2,
    carbohydrates: 15,
    fat: 0.2,
    icon: '🍊'
  },
  {
    id: 'strawberry',
    name: 'Çilek',
    category: 'fruits',
    servingSize: 100,
    servingUnit: 'g',
    calories: 32,
    protein: 0.7,
    carbohydrates: 7.7,
    fat: 0.3,
    icon: '🍓'
  },
  {
    id: 'grapes',
    name: 'Üzüm',
    category: 'fruits',
    servingSize: 100,
    servingUnit: 'g',
    calories: 69,
    protein: 0.7,
    carbohydrates: 18,
    fat: 0.2,
    icon: '🍇'
  },
  {
    id: 'watermelon',
    name: 'Karpuz',
    category: 'fruits',
    servingSize: 200,
    servingUnit: 'g (1 dilim)',
    calories: 60,
    protein: 1.2,
    carbohydrates: 15,
    fat: 0.3,
    icon: '🍉'
  },

  // ATIŞTIRMALIKLAR
  {
    id: 'almonds',
    name: 'Badem',
    category: 'snacks',
    servingSize: 30,
    servingUnit: 'g (1 avuç)',
    calories: 173,
    protein: 6.3,
    carbohydrates: 6.1,
    fat: 14.9,
    icon: '🥜'
  },
  {
    id: 'walnuts',
    name: 'Ceviz',
    category: 'snacks',
    servingSize: 30,
    servingUnit: 'g (1 avuç)',
    calories: 196,
    protein: 4.6,
    carbohydrates: 4.1,
    fat: 19.5,
    icon: '🥜'
  },
  {
    id: 'hazelnuts',
    name: 'Fındık',
    category: 'snacks',
    servingSize: 30,
    servingUnit: 'g (1 avuç)',
    calories: 188,
    protein: 4.5,
    carbohydrates: 5,
    fat: 18.2,
    icon: '🥜'
  },
  {
    id: 'peanut-butter',
    name: 'Fıstık Ezmesi',
    category: 'snacks',
    servingSize: 32,
    servingUnit: 'g (2 yemek kaşığı)',
    calories: 188,
    protein: 8,
    carbohydrates: 6.3,
    fat: 16,
    icon: '🥜'
  },
  {
    id: 'olive',
    name: 'Zeytin',
    category: 'snacks',
    servingSize: 30,
    servingUnit: 'g (5-6 adet)',
    calories: 44,
    protein: 0.3,
    carbohydrates: 1.3,
    fat: 4.4,
    icon: '🫒'
  },
  {
    id: 'honey',
    name: 'Bal',
    category: 'snacks',
    servingSize: 21,
    servingUnit: 'g (1 yemek kaşığı)',
    calories: 64,
    protein: 0.1,
    carbohydrates: 17.3,
    fat: 0,
    icon: '🍯'
  },
  {
    id: 'chocolate-dark',
    name: 'Bitter Çikolata',
    category: 'snacks',
    servingSize: 30,
    servingUnit: 'g (3 kare)',
    calories: 170,
    protein: 2.2,
    carbohydrates: 13,
    fat: 12,
    icon: '🍫'
  },

  // İÇECEKLER
  {
    id: 'tea',
    name: 'Çay (Şekersiz)',
    category: 'drinks',
    servingSize: 200,
    servingUnit: 'ml (1 bardak)',
    calories: 2,
    protein: 0,
    carbohydrates: 0.5,
    fat: 0,
    icon: '🍵'
  },
  {
    id: 'coffee',
    name: 'Türk Kahvesi (Şekersiz)',
    category: 'drinks',
    servingSize: 60,
    servingUnit: 'ml (1 fincan)',
    calories: 2,
    protein: 0.1,
    carbohydrates: 0.4,
    fat: 0,
    icon: '☕'
  },
  {
    id: 'orange-juice',
    name: 'Portakal Suyu',
    category: 'drinks',
    servingSize: 250,
    servingUnit: 'ml (1 bardak)',
    calories: 112,
    protein: 1.7,
    carbohydrates: 26,
    fat: 0.5,
    icon: '🧃'
  },
  {
    id: 'ayran',
    name: 'Ayran',
    category: 'drinks',
    servingSize: 200,
    servingUnit: 'ml (1 bardak)',
    calories: 66,
    protein: 3.4,
    carbohydrates: 4,
    fat: 4,
    icon: '🥛'
  },
  {
    id: 'protein-shake',
    name: 'Protein Shake',
    category: 'drinks',
    servingSize: 1,
    servingUnit: 'ölçek (30g)',
    calories: 120,
    protein: 24,
    carbohydrates: 3,
    fat: 1,
    icon: '🥤'
  },

  // HAZIR YEMEKLER
  {
    id: 'lentil-soup',
    name: 'Mercimek Çorbası',
    category: 'meals',
    servingSize: 250,
    servingUnit: 'ml (1 kase)',
    calories: 180,
    protein: 9,
    carbohydrates: 27,
    fat: 4,
    icon: '🍲'
  },
  {
    id: 'chicken-soup',
    name: 'Tavuk Çorbası',
    category: 'meals',
    servingSize: 250,
    servingUnit: 'ml (1 kase)',
    calories: 75,
    protein: 6,
    carbohydrates: 9,
    fat: 2,
    icon: '🍲'
  },
  {
    id: 'kofta',
    name: 'Köfte (Izgara)',
    category: 'meals',
    servingSize: 100,
    servingUnit: 'g (3-4 adet)',
    calories: 250,
    protein: 17,
    carbohydrates: 5,
    fat: 18,
    icon: '🍖'
  },
  {
    id: 'doner',
    name: 'Tavuk Döner',
    category: 'meals',
    servingSize: 150,
    servingUnit: 'g (1 porsiyon)',
    calories: 280,
    protein: 22,
    carbohydrates: 8,
    fat: 18,
    icon: '🥙'
  },
  {
    id: 'lahmacun',
    name: 'Lahmacun',
    category: 'meals',
    servingSize: 1,
    servingUnit: 'adet',
    calories: 210,
    protein: 9,
    carbohydrates: 28,
    fat: 7,
    icon: '🫓'
  },
  {
    id: 'pide-cheese',
    name: 'Kaşarlı Pide',
    category: 'meals',
    servingSize: 1,
    servingUnit: 'adet',
    calories: 620,
    protein: 24,
    carbohydrates: 68,
    fat: 28,
    icon: '🫓'
  },
  {
    id: 'borek-cheese',
    name: 'Peynirli Börek',
    category: 'meals',
    servingSize: 100,
    servingUnit: 'g (1 dilim)',
    calories: 310,
    protein: 9,
    carbohydrates: 28,
    fat: 18,
    icon: '🥧'
  },
  {
    id: 'menemen',
    name: 'Menemen',
    category: 'meals',
    servingSize: 200,
    servingUnit: 'g (1 porsiyon)',
    calories: 220,
    protein: 12,
    carbohydrates: 8,
    fat: 16,
    icon: '🍳'
  },
  {
    id: 'kuru-fasulye',
    name: 'Kuru Fasulye',
    category: 'meals',
    servingSize: 200,
    servingUnit: 'g (1 porsiyon)',
    calories: 240,
    protein: 14,
    carbohydrates: 40,
    fat: 4,
    icon: '🍲'
  },
  {
    id: 'imam-bayildi',
    name: 'İmam Bayıldı',
    category: 'meals',
    servingSize: 1,
    servingUnit: 'porsiyon',
    calories: 180,
    protein: 3,
    carbohydrates: 12,
    fat: 14,
    icon: '🍆'
  },
  {
    id: 'dolma',
    name: 'Yaprak Sarma',
    category: 'meals',
    servingSize: 5,
    servingUnit: 'adet',
    calories: 150,
    protein: 3,
    carbohydrates: 22,
    fat: 6,
    icon: '🥬'
  },
];

// Yiyecek arama fonksiyonu
export function searchFoods(query: string): FoodItem[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  return foodDatabase.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  );
}

// Kategoriye göre yiyecekleri getir
export function getFoodsByCategory(categoryId: string): FoodItem[] {
  return foodDatabase.filter(food => food.category === categoryId);
}

// ID'ye göre yiyecek getir
export function getFoodById(id: string): FoodItem | undefined {
  return foodDatabase.find(food => food.id === id);
}

