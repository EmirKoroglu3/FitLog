import { foodMatchScore } from './foodSearch';
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
  { id: 'meals', name: 'Yemekler', icon: '🍲' },
  { id: 'soups', name: 'Çorbalar', icon: '🥣' },
  { id: 'desserts', name: 'Tatlılar', icon: '🍰' },
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
    category: 'soups',
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
    category: 'soups',
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

  // ---- Ek: fitness odaklı yiyecekler (yaklaşık değerler, porsiyon başına) ----
  // PROTEIN
  { id: 'egg-white', name: 'Yumurta Akı', category: 'protein', servingSize: 1, servingUnit: 'adet (33g)', calories: 17, protein: 3.6, carbohydrates: 0.2, fat: 0.1, icon: '🥚' },
  { id: 'omelette', name: 'Omlet (2 Yumurta)', category: 'protein', servingSize: 1, servingUnit: 'porsiyon (120g)', calories: 190, protein: 13, carbohydrates: 1, fat: 15, icon: '🍳' },
  { id: 'turkey-breast', name: 'Hindi Füme', category: 'protein', servingSize: 50, servingUnit: 'g', calories: 55, protein: 10, carbohydrates: 1, fat: 1.2, icon: '🦃' },
  { id: 'chicken-wing', name: 'Tavuk Kanat (Izgara)', category: 'protein', servingSize: 100, servingUnit: 'g', calories: 210, protein: 25, carbohydrates: 0, fat: 12, icon: '🍗' },
  { id: 'sucuk', name: 'Sucuk', category: 'protein', servingSize: 30, servingUnit: 'g', calories: 130, protein: 6, carbohydrates: 0.5, fat: 11.5, icon: '🌭' },
  { id: 'tuna-water', name: 'Ton Balığı (Su İçinde)', category: 'protein', servingSize: 100, servingUnit: 'g (süzülmüş)', calories: 116, protein: 26, carbohydrates: 0, fat: 1, icon: '🐟' },
  { id: 'lentils', name: 'Yeşil Mercimek (Haşlanmış)', category: 'protein', servingSize: 100, servingUnit: 'g', calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, icon: '🫘' },
  { id: 'chickpeas', name: 'Nohut (Haşlanmış)', category: 'protein', servingSize: 100, servingUnit: 'g', calories: 164, protein: 8.9, carbohydrates: 27, fat: 2.6, icon: '🫘' },

  // SÜT ÜRÜNLERİ
  { id: 'skyr', name: 'Skyr / Proteinli Yoğurt', category: 'dairy', servingSize: 150, servingUnit: 'g', calories: 100, protein: 15, carbohydrates: 6, fat: 0.3, icon: '🥣' },
  { id: 'kefir', name: 'Kefir', category: 'dairy', servingSize: 200, servingUnit: 'ml', calories: 110, protein: 7, carbohydrates: 9, fat: 5, icon: '🥛' },
  { id: 'labneh-light', name: 'Light Labne', category: 'dairy', servingSize: 30, servingUnit: 'g', calories: 45, protein: 2, carbohydrates: 1.5, fat: 3.5, icon: '🧀' },
  { id: 'protein-milk', name: 'Proteinli Süt', category: 'dairy', servingSize: 250, servingUnit: 'ml', calories: 150, protein: 25, carbohydrates: 10, fat: 1.5, icon: '🥛' },

  // TAHILLAR
  { id: 'brown-rice', name: 'Esmer Pirinç (Pişmiş)', category: 'grains', servingSize: 150, servingUnit: 'g', calories: 165, protein: 3.8, carbohydrates: 34, fat: 1.4, icon: '🍚' },
  { id: 'quinoa', name: 'Kinoa (Pişmiş)', category: 'grains', servingSize: 150, servingUnit: 'g', calories: 180, protein: 6.6, carbohydrates: 32, fat: 2.9, icon: '🍚' },
  { id: 'rice-cake', name: 'Pirinç Patlağı', category: 'grains', servingSize: 1, servingUnit: 'adet (9g)', calories: 35, protein: 0.7, carbohydrates: 7.3, fat: 0.3, icon: '🍘' },
  { id: 'granola', name: 'Granola', category: 'grains', servingSize: 40, servingUnit: 'g', calories: 180, protein: 4, carbohydrates: 26, fat: 7, icon: '🥣' },
  { id: 'wrap-whole', name: 'Tam Buğday Lavaş', category: 'grains', servingSize: 1, servingUnit: 'adet (60g)', calories: 175, protein: 5, carbohydrates: 30, fat: 4, icon: '🫓' },
  { id: 'simit', name: 'Simit', category: 'grains', servingSize: 1, servingUnit: 'adet (120g)', calories: 380, protein: 11, carbohydrates: 64, fat: 9, icon: '🥯' },

  // SEBZELER
  { id: 'sweet-potato', name: 'Tatlı Patates (Fırın)', category: 'vegetables', servingSize: 150, servingUnit: 'g', calories: 135, protein: 3, carbohydrates: 31, fat: 0.2, icon: '🍠' },
  { id: 'avocado', name: 'Avokado', category: 'vegetables', servingSize: 100, servingUnit: 'g (yarım)', calories: 160, protein: 2, carbohydrates: 8.5, fat: 14.7, icon: '🥑' },
  { id: 'mushroom', name: 'Mantar (Sote)', category: 'vegetables', servingSize: 100, servingUnit: 'g', calories: 45, protein: 3.1, carbohydrates: 3.3, fat: 2.5, icon: '🍄' },
  { id: 'green-beans', name: 'Zeytinyağlı Taze Fasulye', category: 'vegetables', servingSize: 200, servingUnit: 'g', calories: 150, protein: 3, carbohydrates: 12, fat: 10, icon: '🫛' },

  // MEYVELER
  { id: 'kiwi', name: 'Kivi', category: 'fruits', servingSize: 1, servingUnit: 'adet (75g)', calories: 46, protein: 0.9, carbohydrates: 11, fat: 0.4, icon: '🥝' },
  { id: 'blueberry', name: 'Yaban Mersini', category: 'fruits', servingSize: 100, servingUnit: 'g', calories: 57, protein: 0.7, carbohydrates: 14.5, fat: 0.3, icon: '🫐' },
  { id: 'dates', name: 'Hurma', category: 'fruits', servingSize: 3, servingUnit: 'adet (24g)', calories: 68, protein: 0.6, carbohydrates: 18, fat: 0.1, icon: '🌴' },
  { id: 'dried-apricot', name: 'Kuru Kayısı', category: 'fruits', servingSize: 5, servingUnit: 'adet (40g)', calories: 96, protein: 1.4, carbohydrates: 25, fat: 0.2, icon: '🍑' },

  // ATIŞTIRMALIKLAR
  { id: 'protein-bar', name: 'Protein Bar', category: 'snacks', servingSize: 1, servingUnit: 'adet (60g)', calories: 210, protein: 20, carbohydrates: 20, fat: 7, icon: '🍫' },
  { id: 'cashew', name: 'Kaju', category: 'snacks', servingSize: 30, servingUnit: 'g', calories: 165, protein: 5.5, carbohydrates: 9, fat: 13, icon: '🥜' },
  { id: 'leblebi', name: 'Leblebi', category: 'snacks', servingSize: 30, servingUnit: 'g', calories: 110, protein: 6, carbohydrates: 18, fat: 1.8, icon: '🫘' },

  // İÇECEKLER
  { id: 'water', name: 'Su', category: 'drinks', servingSize: 500, servingUnit: 'ml', calories: 0, protein: 0, carbohydrates: 0, fat: 0, icon: '💧' },
  { id: 'filter-coffee', name: 'Filtre Kahve / Americano', category: 'drinks', servingSize: 240, servingUnit: 'ml', calories: 2, protein: 0.3, carbohydrates: 0, fat: 0, icon: '☕' },
  { id: 'latte', name: 'Latte (Yarım Yağlı Süt)', category: 'drinks', servingSize: 350, servingUnit: 'ml', calories: 190, protein: 13, carbohydrates: 19, fat: 7, icon: '☕' },
  { id: 'green-tea', name: 'Yeşil Çay', category: 'drinks', servingSize: 250, servingUnit: 'ml', calories: 2, protein: 0, carbohydrates: 0, fat: 0, icon: '🍵' },
  { id: 'energy-drink', name: 'Enerji İçeceği', category: 'drinks', servingSize: 250, servingUnit: 'ml', calories: 113, protein: 0, carbohydrates: 27, fat: 0, icon: '🥫' },
  { id: 'cola-zero', name: 'Kola (Şekersiz)', category: 'drinks', servingSize: 330, servingUnit: 'ml', calories: 1, protein: 0, carbohydrates: 0, fat: 0, icon: '🥤' },
  { id: 'cola', name: 'Kola', category: 'drinks', servingSize: 330, servingUnit: 'ml', calories: 139, protein: 0, carbohydrates: 35, fat: 0, icon: '🥤' },
  { id: 'mineral-water', name: 'Maden Suyu', category: 'drinks', servingSize: 200, servingUnit: 'ml', calories: 0, protein: 0, carbohydrates: 0, fat: 0, icon: '🫧' },

  // HAZIR YEMEKLER
  { id: 'meal-prep-chicken-rice', name: 'Tavuk & Pirinç (Meal Prep)', category: 'meals', servingSize: 1, servingUnit: 'kutu (400g)', calories: 600, protein: 45, carbohydrates: 70, fat: 14, icon: '🍱' },
  { id: 'chicken-saute', name: 'Tavuk Sote', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 360, protein: 35, carbohydrates: 12, fat: 19, icon: '🍲' },
  { id: 'etli-nohut', name: 'Etli Nohut', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 420, protein: 24, carbohydrates: 42, fat: 17, icon: '🍲' },
  { id: 'manti', name: 'Mantı (Yoğurtlu)', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 480, protein: 20, carbohydrates: 55, fat: 20, icon: '🥟' },
  { id: 'cheese-toast', name: 'Kaşarlı Tost', category: 'meals', servingSize: 1, servingUnit: 'adet (150g)', calories: 380, protein: 17, carbohydrates: 38, fat: 17, icon: '🥪' },
  { id: 'pizza-slice', name: 'Pizza (Karışık)', category: 'meals', servingSize: 1, servingUnit: 'dilim (110g)', calories: 285, protein: 12, carbohydrates: 36, fat: 10, icon: '🍕' },
  { id: 'hamburger', name: 'Hamburger', category: 'meals', servingSize: 1, servingUnit: 'adet (250g)', calories: 550, protein: 28, carbohydrates: 45, fat: 28, icon: '🍔' },

  // EV YEMEKLERİ, KEBAPLAR, BÖREKLER, KAHVALTILIK (porsiyon başına, ortalama ev tarifi)
  { id: 'et-sote', name: 'Et Sote', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 380, protein: 32, carbohydrates: 10, fat: 23, icon: '🥩' },
  { id: 'tas-kebabi', name: 'Tas Kebabı', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 390, protein: 28, carbohydrates: 16, fat: 24, icon: '🍲' },
  { id: 'etli-guvec', name: 'Etli Güveç', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 420, protein: 28, carbohydrates: 20, fat: 25, icon: '🍲' },
  { id: 'coban-kavurma', name: 'Çoban Kavurma', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 360, protein: 26, carbohydrates: 10, fat: 24, icon: '🥩' },
  { id: 'kuzu-tandir', name: 'Kuzu Tandır', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 480, protein: 40, carbohydrates: 0, fat: 35, icon: '🍖' },
  { id: 'kavurma', name: 'Kavurma', category: 'meals', servingSize: 100, servingUnit: 'g', calories: 340, protein: 26, carbohydrates: 0, fat: 26, icon: '🥩' },
  { id: 'hunkar-begendi', name: 'Hünkar Beğendi', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 520, protein: 30, carbohydrates: 20, fat: 36, icon: '🍲' },
  { id: 'ali-nazik', name: 'Ali Nazik', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 430, protein: 30, carbohydrates: 14, fat: 28, icon: '🍲' },
  { id: 'kofte-patates', name: 'Fırında Köfte Patates', category: 'meals', servingSize: 350, servingUnit: 'g', calories: 520, protein: 30, carbohydrates: 32, fat: 30, icon: '🍲' },
  { id: 'sulu-kofte', name: 'Sulu Köfte (İzmir Köfte)', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 410, protein: 24, carbohydrates: 28, fat: 22, icon: '🍲' },
  { id: 'kadinbudu-kofte', name: 'Kadınbudu Köfte', category: 'meals', servingSize: 2, servingUnit: 'adet (160g)', calories: 430, protein: 24, carbohydrates: 18, fat: 29, icon: '🍖' },
  { id: 'inegol-kofte', name: 'İnegöl Köfte', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 520, protein: 34, carbohydrates: 4, fat: 41, icon: '🍖' },
  { id: 'kiymali-patates', name: 'Kıymalı Patates', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 330, protein: 16, carbohydrates: 26, fat: 18, icon: '🍲' },
  { id: 'adana-kebap', name: 'Adana Kebap (Lavaşsız)', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 560, protein: 34, carbohydrates: 4, fat: 46, icon: '🍢' },
  { id: 'urfa-kebap', name: 'Urfa Kebap (Lavaşsız)', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 540, protein: 34, carbohydrates: 4, fat: 44, icon: '🍢' },
  { id: 'iskender', name: 'İskender Kebap', category: 'meals', servingSize: 1, servingUnit: 'porsiyon (350g)', calories: 760, protein: 40, carbohydrates: 45, fat: 46, icon: '🍽️' },
  { id: 'et-doner-durum', name: 'Et Döner Dürüm', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 650, protein: 35, carbohydrates: 55, fat: 32, icon: '🌯' },
  { id: 'tavuk-doner-durum', name: 'Tavuk Döner Dürüm', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 560, protein: 34, carbohydrates: 55, fat: 22, icon: '🌯' },
  { id: 'tavuk-sis', name: 'Tavuk Şiş', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 300, protein: 44, carbohydrates: 4, fat: 12, icon: '🍢' },
  { id: 'kuzu-sis', name: 'Kuzu Şiş', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 480, protein: 40, carbohydrates: 2, fat: 35, icon: '🍢' },
  { id: 'pirzola', name: 'Kuzu Pirzola', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 560, protein: 38, carbohydrates: 0, fat: 45, icon: '🍖' },
  { id: 'beyti', name: 'Beyti Kebap', category: 'meals', servingSize: 1, servingUnit: 'porsiyon (300g)', calories: 720, protein: 38, carbohydrates: 40, fat: 44, icon: '🍢' },
  { id: 'tantuni', name: 'Tantuni Dürüm', category: 'meals', servingSize: 1, servingUnit: 'adet (250g)', calories: 480, protein: 28, carbohydrates: 45, fat: 20, icon: '🌯' },
  { id: 'kokorec', name: 'Kokoreç (Yarım Ekmek)', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 650, protein: 28, carbohydrates: 50, fat: 38, icon: '🥖' },
  { id: 'tavuk-kanat-6', name: 'Tavuk Kanat (6 Adet)', category: 'meals', servingSize: 1, servingUnit: 'porsiyon (200g)', calories: 420, protein: 36, carbohydrates: 0, fat: 30, icon: '🍗' },
  { id: 'firin-tavuk', name: 'Fırın Tavuk (Baget)', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 430, protein: 38, carbohydrates: 2, fat: 30, icon: '🍗' },
  { id: 'tavuk-izgara-pilav', name: 'Tavuklu Pilav', category: 'meals', servingSize: 350, servingUnit: 'g', calories: 580, protein: 32, carbohydrates: 70, fat: 18, icon: '🍛' },
  { id: 'pilav-ustu-kuru', name: 'Pilav Üstü Kuru Fasulye', category: 'meals', servingSize: 400, servingUnit: 'g', calories: 620, protein: 22, carbohydrates: 92, fat: 17, icon: '🍛' },
  { id: 'karniyarik', name: 'Karnıyarık', category: 'meals', servingSize: 1, servingUnit: 'adet (250g)', calories: 380, protein: 14, carbohydrates: 22, fat: 27, icon: '🍆' },
  { id: 'musakka', name: 'Patlıcan Musakka', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 340, protein: 16, carbohydrates: 18, fat: 23, icon: '🍆' },
  { id: 'kabak-musakka', name: 'Kabak Musakka', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 230, protein: 12, carbohydrates: 14, fat: 14, icon: '🥒' },
  { id: 'turlu', name: 'Türlü', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 220, protein: 9, carbohydrates: 22, fat: 11, icon: '🥘' },
  { id: 'etli-taze-fasulye', name: 'Etli Taze Fasulye', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 230, protein: 12, carbohydrates: 16, fat: 13, icon: '🫛' },
  { id: 'etli-bezelye', name: 'Etli Bezelye', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 260, protein: 15, carbohydrates: 24, fat: 11, icon: '🫛' },
  { id: 'kiymali-ispanak', name: 'Kıymalı Ispanak', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 210, protein: 13, carbohydrates: 12, fat: 12, icon: '🥬' },
  { id: 'zeytinyagli-pirasa', name: 'Zeytinyağlı Pırasa', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 150, protein: 3, carbohydrates: 18, fat: 8, icon: '🥬' },
  { id: 'zeytinyagli-enginar', name: 'Zeytinyağlı Enginar', category: 'meals', servingSize: 1, servingUnit: 'adet (200g)', calories: 170, protein: 4, carbohydrates: 18, fat: 9, icon: '🥗' },
  { id: 'biber-dolmasi', name: 'Etli Biber Dolması', category: 'meals', servingSize: 2, servingUnit: 'adet (250g)', calories: 330, protein: 13, carbohydrates: 34, fat: 16, icon: '🫑' },
  { id: 'lahana-sarmasi', name: 'Etli Lahana Sarması', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 300, protein: 13, carbohydrates: 30, fat: 14, icon: '🥬' },
  { id: 'patates-yemegi', name: 'Etli Patates Yemeği', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 280, protein: 14, carbohydrates: 26, fat: 13, icon: '🥔' },
  { id: 'barbunya', name: 'Zeytinyağlı Barbunya', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 220, protein: 9, carbohydrates: 28, fat: 8, icon: '🫘' },
  { id: 'mercimek-kofte', name: 'Mercimek Köftesi', category: 'meals', servingSize: 5, servingUnit: 'adet (150g)', calories: 270, protein: 10, carbohydrates: 44, fat: 6, icon: '🧆' },
  { id: 'kisir', name: 'Kısır', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 260, protein: 6, carbohydrates: 40, fat: 9, icon: '🥗' },
  { id: 'fellah-kofte', name: 'Fellah Köftesi', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 380, protein: 10, carbohydrates: 58, fat: 12, icon: '🍲' },
  { id: 'cig-kofte-durum', name: 'Çiğ Köfte Dürüm (Etsiz)', category: 'meals', servingSize: 1, servingUnit: 'adet (200g)', calories: 380, protein: 10, carbohydrates: 72, fat: 6, icon: '🌯' },
  { id: 'nohutlu-pilav', name: 'Nohutlu Pilav', category: 'meals', servingSize: 250, servingUnit: 'g', calories: 400, protein: 10, carbohydrates: 70, fat: 9, icon: '🍚' },
  { id: 'kiymali-makarna', name: 'Kıymalı Makarna', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 520, protein: 24, carbohydrates: 66, fat: 17, icon: '🍝' },
  { id: 'firin-makarna', name: 'Fırın Makarna', category: 'meals', servingSize: 300, servingUnit: 'g', calories: 540, protein: 22, carbohydrates: 60, fat: 23, icon: '🍝' },
  { id: 'hamsi-tava', name: 'Hamsi Tava', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 460, protein: 30, carbohydrates: 14, fat: 32, icon: '🐟' },
  { id: 'cupra-izgara', name: 'Çupra (Izgara)', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 320, protein: 52, carbohydrates: 0, fat: 12, icon: '🐟' },
  { id: 'balik-ekmek', name: 'Balık Ekmek', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 520, protein: 30, carbohydrates: 55, fat: 20, icon: '🥖' },
  { id: 'midye-dolma', name: 'Midye Dolma', category: 'meals', servingSize: 10, servingUnit: 'adet (200g)', calories: 350, protein: 14, carbohydrates: 45, fat: 12, icon: '🦪' },
  { id: 'kiymali-pide', name: 'Kıymalı Pide', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 650, protein: 30, carbohydrates: 80, fat: 22, icon: '🫓' },
  { id: 'kusbasili-pide', name: 'Kuşbaşılı Pide', category: 'meals', servingSize: 1, servingUnit: 'adet (300g)', calories: 700, protein: 35, carbohydrates: 78, fat: 26, icon: '🫓' },
  { id: 'su-boregi', name: 'Su Böreği', category: 'meals', servingSize: 1, servingUnit: 'dilim (150g)', calories: 380, protein: 14, carbohydrates: 30, fat: 23, icon: '🥧' },
  { id: 'sigara-boregi', name: 'Sigara Böreği', category: 'meals', servingSize: 4, servingUnit: 'adet (120g)', calories: 360, protein: 10, carbohydrates: 26, fat: 24, icon: '🥟' },
  { id: 'ispanakli-borek', name: 'Ispanaklı Börek', category: 'meals', servingSize: 1, servingUnit: 'dilim (150g)', calories: 330, protein: 9, carbohydrates: 30, fat: 19, icon: '🥧' },
  { id: 'patatesli-borek', name: 'Patatesli Börek', category: 'meals', servingSize: 1, servingUnit: 'dilim (150g)', calories: 360, protein: 8, carbohydrates: 40, fat: 18, icon: '🥧' },
  { id: 'gozleme', name: 'Peynirli Gözleme', category: 'meals', servingSize: 1, servingUnit: 'adet (250g)', calories: 450, protein: 18, carbohydrates: 50, fat: 20, icon: '🫓' },
  { id: 'acma', name: 'Açma', category: 'grains', servingSize: 1, servingUnit: 'adet (100g)', calories: 360, protein: 7, carbohydrates: 44, fat: 17, icon: '🥐' },
  { id: 'pogaca', name: 'Peynirli Poğaça', category: 'grains', servingSize: 1, servingUnit: 'adet (90g)', calories: 330, protein: 9, carbohydrates: 34, fat: 17, icon: '🥐' },
  { id: 'kumpir', name: 'Kumpir', category: 'meals', servingSize: 1, servingUnit: 'adet (450g)', calories: 650, protein: 18, carbohydrates: 70, fat: 32, icon: '🥔' },
  { id: 'patates-kizartmasi', name: 'Patates Kızartması', category: 'meals', servingSize: 150, servingUnit: 'g', calories: 470, protein: 5, carbohydrates: 52, fat: 26, icon: '🍟' },
  { id: 'karisik-tost', name: 'Karışık Tost', category: 'meals', servingSize: 1, servingUnit: 'adet (180g)', calories: 430, protein: 21, carbohydrates: 38, fat: 21, icon: '🥪' },
  { id: 'waffle', name: 'Waffle (Meyveli)', category: 'desserts', servingSize: 1, servingUnit: 'adet (250g)', calories: 620, protein: 10, carbohydrates: 80, fat: 28, icon: '🧇' },
  { id: 'sucuklu-yumurta', name: 'Sucuklu Yumurta', category: 'meals', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 360, protein: 21, carbohydrates: 2, fat: 30, icon: '🍳' },
  { id: 'pastirmali-yumurta', name: 'Pastırmalı Yumurta', category: 'meals', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 300, protein: 24, carbohydrates: 2, fat: 21, icon: '🍳' },
  { id: 'kuymak', name: 'Kuymak (Mıhlama)', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 560, protein: 18, carbohydrates: 30, fat: 42, icon: '🧀' },
  { id: 'pisi', name: 'Pişi', category: 'grains', servingSize: 1, servingUnit: 'adet (70g)', calories: 260, protein: 5, carbohydrates: 30, fat: 13, icon: '🫓' },
  { id: 'tahin-pekmez', name: 'Tahin Pekmez', category: 'snacks', servingSize: 2, servingUnit: 'yemek kaşığı (40g)', calories: 200, protein: 4, carbohydrates: 18, fat: 13, icon: '🍯' },
  { id: 'ezine-peynir', name: 'Ezine Peyniri', category: 'dairy', servingSize: 30, servingUnit: 'g', calories: 90, protein: 5, carbohydrates: 0.5, fat: 7.5, icon: '🧀' },
  { id: 'tulum-peynir', name: 'Tulum Peyniri', category: 'dairy', servingSize: 30, servingUnit: 'g', calories: 110, protein: 6, carbohydrates: 0.5, fat: 9, icon: '🧀' },
  { id: 'pastirma', name: 'Pastırma', category: 'protein', servingSize: 30, servingUnit: 'g', calories: 75, protein: 9, carbohydrates: 0.5, fat: 4, icon: '🥩' },
  { id: 'kaymak', name: 'Kaymak', category: 'dairy', servingSize: 20, servingUnit: 'g', calories: 120, protein: 0.5, carbohydrates: 0.5, fat: 13, icon: '🧈' },
  { id: 'recel', name: 'Reçel', category: 'snacks', servingSize: 1, servingUnit: 'yemek kaşığı (20g)', calories: 50, protein: 0, carbohydrates: 13, fat: 0, icon: '🍓' },
  { id: 'cacik', name: 'Cacık', category: 'meals', servingSize: 200, servingUnit: 'ml', calories: 110, protein: 6, carbohydrates: 8, fat: 6, icon: '🥒' },
  { id: 'coban-salata', name: 'Çoban Salata', category: 'vegetables', servingSize: 200, servingUnit: 'g', calories: 120, protein: 2, carbohydrates: 10, fat: 8, icon: '🥗' },
  { id: 'piyaz', name: 'Piyaz', category: 'meals', servingSize: 200, servingUnit: 'g', calories: 240, protein: 10, carbohydrates: 30, fat: 9, icon: '🫘' },
  { id: 'humus', name: 'Humus', category: 'snacks', servingSize: 100, servingUnit: 'g', calories: 250, protein: 8, carbohydrates: 14, fat: 18, icon: '🫘' },

  // ÇORBALAR (1 kase ≈ 250 ml, yaklaşık değerler)
  { id: 'ezogelin-soup', name: 'Ezogelin Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 150, protein: 7, carbohydrates: 24, fat: 3, icon: '🥣' },
  { id: 'yayla-soup', name: 'Yayla Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 140, protein: 6, carbohydrates: 16, fat: 6, icon: '🥣' },
  { id: 'tomato-soup', name: 'Domates Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 120, protein: 3, carbohydrates: 16, fat: 5, icon: '🥣' },
  { id: 'tarhana-soup', name: 'Tarhana Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 130, protein: 5, carbohydrates: 20, fat: 3.5, icon: '🥣' },
  { id: 'mushroom-soup', name: 'Kremalı Mantar Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 160, protein: 4, carbohydrates: 12, fat: 11, icon: '🥣' },
  { id: 'vegetable-soup', name: 'Sebze Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 90, protein: 3, carbohydrates: 14, fat: 2.5, icon: '🥣' },
  { id: 'iskembe-soup', name: 'İşkembe Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 190, protein: 14, carbohydrates: 6, fat: 12, icon: '🥣' },
  { id: 'kelle-paca-soup', name: 'Kelle Paça Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 210, protein: 16, carbohydrates: 4, fat: 14, icon: '🥣' },
  { id: 'broccoli-soup', name: 'Kremalı Brokoli Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 150, protein: 5, carbohydrates: 12, fat: 9, icon: '🥣' },
  { id: 'sehriye-soup', name: 'Şehriye Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 110, protein: 4, carbohydrates: 18, fat: 2.5, icon: '🥣' },
  { id: 'dugun-soup', name: 'Düğün Çorbası', category: 'soups', servingSize: 250, servingUnit: 'ml', calories: 180, protein: 12, carbohydrates: 10, fat: 10, icon: '🥣' },

  // TATLILAR (porsiyon başına, yaklaşık değerler)
  { id: 'baklava', name: 'Baklava (Fıstıklı)', category: 'desserts', servingSize: 1, servingUnit: 'dilim (40g)', calories: 170, protein: 3, carbohydrates: 18, fat: 10, icon: '🥮' },
  { id: 'kunefe', name: 'Künefe', category: 'desserts', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 500, protein: 12, carbohydrates: 55, fat: 26, icon: '🧀' },
  { id: 'sutlac', name: 'Sütlaç', category: 'desserts', servingSize: 1, servingUnit: 'kase (200g)', calories: 250, protein: 7, carbohydrates: 40, fat: 7, icon: '🍮' },
  { id: 'kazandibi', name: 'Kazandibi', category: 'desserts', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 230, protein: 6, carbohydrates: 36, fat: 7, icon: '🍮' },
  { id: 'tavuk-gogsu-tatli', name: 'Tavuk Göğsü (Tatlı)', category: 'desserts', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 220, protein: 6, carbohydrates: 34, fat: 6.5, icon: '🍮' },
  { id: 'revani', name: 'Revani', category: 'desserts', servingSize: 1, servingUnit: 'dilim (80g)', calories: 290, protein: 4, carbohydrates: 50, fat: 8, icon: '🍰' },
  { id: 'kemalpasa', name: 'Kemalpaşa', category: 'desserts', servingSize: 3, servingUnit: 'adet (60g)', calories: 200, protein: 4, carbohydrates: 36, fat: 4.5, icon: '🍯' },
  { id: 'lokma', name: 'Lokma', category: 'desserts', servingSize: 5, servingUnit: 'adet (75g)', calories: 280, protein: 3, carbohydrates: 40, fat: 12, icon: '🍩' },
  { id: 'asure', name: 'Aşure', category: 'desserts', servingSize: 1, servingUnit: 'kase (200g)', calories: 300, protein: 6, carbohydrates: 62, fat: 4, icon: '🥣' },
  { id: 'profiterol', name: 'Profiterol', category: 'desserts', servingSize: 1, servingUnit: 'porsiyon (150g)', calories: 380, protein: 6, carbohydrates: 42, fat: 21, icon: '🍫' },
  { id: 'ice-cream', name: 'Dondurma (Sade)', category: 'desserts', servingSize: 2, servingUnit: 'top (100g)', calories: 210, protein: 3.5, carbohydrates: 24, fat: 11, icon: '🍨' },
  { id: 'chocolate-cake', name: 'Çikolatalı Pasta', category: 'desserts', servingSize: 1, servingUnit: 'dilim (100g)', calories: 380, protein: 5, carbohydrates: 48, fat: 19, icon: '🍰' },
  { id: 'cheesecake', name: 'Cheesecake', category: 'desserts', servingSize: 1, servingUnit: 'dilim (100g)', calories: 320, protein: 6, carbohydrates: 26, fat: 22, icon: '🍰' },
  { id: 'tiramisu', name: 'Tiramisu', category: 'desserts', servingSize: 1, servingUnit: 'dilim (100g)', calories: 290, protein: 5, carbohydrates: 28, fat: 17, icon: '🍰' },
  { id: 'magnolia', name: 'Magnolia', category: 'desserts', servingSize: 1, servingUnit: 'kase (150g)', calories: 300, protein: 5, carbohydrates: 38, fat: 14, icon: '🍮' },
  { id: 'cookie', name: 'Kurabiye', category: 'desserts', servingSize: 2, servingUnit: 'adet (30g)', calories: 150, protein: 2, carbohydrates: 19, fat: 7.5, icon: '🍪' },
  { id: 'tahin-helva', name: 'Tahin Helvası', category: 'desserts', servingSize: 50, servingUnit: 'g', calories: 270, protein: 6, carbohydrates: 27, fat: 16, icon: '🍯' },
  { id: 'lokum', name: 'Lokum', category: 'desserts', servingSize: 2, servingUnit: 'adet (30g)', calories: 105, protein: 0, carbohydrates: 26, fat: 0.2, icon: '🍬' },
  { id: 'protein-pudding', name: 'Proteinli Puding', category: 'desserts', servingSize: 1, servingUnit: 'kase (200g)', calories: 160, protein: 20, carbohydrates: 14, fat: 3, icon: '🍮' },
];

// Yiyecek arama fonksiyonu
export function searchFoods(query: string): FoodItem[] {
  if (!query.trim()) return [];
  const categoryName = (id: string) => foodCategories.find((c) => c.id === id)?.name ?? '';
  return foodDatabase
    .map((food) => ({ food, score: foodMatchScore(query, food.name, [categoryName(food.category)]) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, 'tr'))
    .map((r) => r.food);
}

// Kategoriye göre yiyecekleri getir
export function getFoodsByCategory(categoryId: string): FoodItem[] {
  return foodDatabase.filter(food => food.category === categoryId);
}

// ID'ye göre yiyecek getir
export function getFoodById(id: string): FoodItem | undefined {
  return foodDatabase.find(food => food.id === id);
}

