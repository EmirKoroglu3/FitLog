import { exerciseDatabase, type ExerciseItem } from './exerciseDatabase';

export interface ExerciseGuide extends Pick<ExerciseItem, 'name' | 'muscleGroup' | 'equipment' | 'category'> {
  steps?: string[];
  tip?: string;
}

/** Short how-to for the most common lifts (keyed by exercise id). */
const HOW_TO: Record<string, { steps: string[]; tip?: string }> = {
  'bench-press': {
    steps: [
      'Sehpaya uzan, gözlerin barın hizasında olsun; kürek kemiklerini geriye ve aşağı sıkıştır.',
      'Barı omuz genişliğinden biraz geniş tut, ayaklarını yere sağlam bas.',
      'Barı kontrollü şekilde göğsünün alt kısmına indir; dirsekler gövdeyle ~45° açı yapsın.',
      'Göğsünden it, barı omuzlarının üzerine geri getir.',
    ],
    tip: 'Kalçanı sehpadan kaldırma; ağır setlerde mutlaka spotter kullan.',
  },
  'incline-bench-press': {
    steps: ['Sehpayı 30–45° eğime ayarla.', 'Barı üst göğse indir.', 'Kürek kemiklerini sıkı tutarak yukarı it.'],
    tip: 'Eğim arttıkça omuz devreye girer; 30° üst göğüs için idealdir.',
  },
  'dumbbell-fly': {
    steps: ['Dumbbell\'ları göğsün üzerinde, avuçlar karşılıklı tut.', 'Dirsekler hafif bükük, kolları yay çizerek yana aç.', 'Göğüste esneme hissedince aynı yaydan geri topla.'],
    tip: 'Ağırlığı değil esnemeyi hedefle; dirsekleri kilitleme.',
  },
  'push-up': {
    steps: ['Eller omuz genişliğinde, vücut baştan topuğa düz bir çizgi.', 'Göğsün yere yaklaşana kadar in.', 'Gövdeyi bükmeden yukarı it.'],
    tip: 'Zorlanıyorsan dizlerinin üzerinde ya da eğimli yüzeyde başla.',
  },
  'lat-pulldown': {
    steps: ['Barı omuzdan geniş tut, dizlerini pedin altına sabitle.', 'Göğsünü kaldır, barı üst göğsüne çek.', 'Kürek kemiklerini aşağı sıkıştır, kontrollü bırak.'],
    tip: 'Geriye fazla yaslanıp momentum kullanma.',
  },
  'pull-up': {
    steps: ['Barı omuzdan biraz geniş, avuçlar öne bakacak şekilde tut.', 'Kürek kemiklerini aşağı çekerek başla.', 'Çenen barı geçene kadar çek, kontrollü in.'],
    tip: 'Yapamıyorsan bant destekli ya da negatif (sadece iniş) tekrarlarla başla.',
  },
  'barbell-row': {
    steps: ['Barı tut, kalçadan menteşe yaparak gövdeyi ~45° öne eğ.', 'Sırt düz, barı göbek hizasına çek.', 'Dirsekleri geriye götür, kontrollü indir.'],
    tip: 'Belini yuvarlama; ağırlık fazlaysa gövdeni dikleştiriyorsun demektir.',
  },
  'seated-cable-row': {
    steps: ['Dik otur, ayaklar platformda, dizler hafif bükük.', 'Tutamağı karnına doğru çek.', 'Kürek kemiklerini sıkıştır, kollar uzayana kadar bırak.'],
  },
  deadlift: {
    steps: [
      'Bar ayak ortasının üstünde, ayaklar kalça genişliğinde.',
      'Kalçadan menteşe yap, barı tut; göğüs yukarıda, sırt düz.',
      'Barı bacaklarına yakın tutarak yerden it; kalça ve diz aynı anda açılsın.',
      'Tepede kalçayı sık, barı aynı yoldan kontrollü indir.',
    ],
    tip: 'Sırtın yuvarlanıyorsa ağırlığı azalt. Bar hep vücuduna yakın kalsın.',
  },
  'romanian-deadlift': {
    steps: ['Barı kalça hizasında tut, dizler hafif bükük.', 'Kalçanı geriye iterek gövdeyi öne eğ; bar bacakların önünden kaysın.', 'Arka bacakta gerilme hissedince kalçayı öne iterek kalk.'],
    tip: 'Hareket kalçadan gelir, belden değil. Dizler neredeyse sabit kalır.',
  },
  'overhead-press': {
    steps: ['Barı köprücük kemiği hizasında, dirsekler hafif önde tut.', 'Karın ve kalçayı sık, barı düz yukarı it.', 'Bar alnını geçince başını hafif öne al, kolları kilitle.'],
    tip: 'Belini geriye bükme; core sıkı kalmalı.',
  },
  'dumbbell-shoulder-press': {
    steps: ['Sırt destekli otur, dumbbell\'lar kulak hizasında.', 'Yukarı it, tepede dumbbell\'lar birbirine yaklaşsın.', 'Kontrollü şekilde kulak hizasına indir.'],
  },
  'lateral-raise': {
    steps: ['Dumbbell\'lar yanında, dirsekler hafif bükük.', 'Kolları omuz hizasına kadar yana kaldır.', 'Yavaşça indir.'],
    tip: 'Hafif ağırlık + yüksek tekrar. Omuz silkme (trapez) ile kaldırma.',
  },
  'face-pull': {
    steps: ['Halat makarası göz hizasında.', 'Halatı yüzüne doğru çek, elleri kulakların yanına aç.', 'Arka omzu sık, kontrollü bırak.'],
    tip: 'Omuz sağlığı için her itiş antrenmanına eklemek iyi bir fikir.',
  },
  'barbell-curl': {
    steps: ['Barı omuz genişliğinde, avuçlar yukarı tut.', 'Dirsekleri gövdeye sabitleyip barı kaldır.', 'Kontrollü indir.'],
    tip: 'Gövdeyi sallayarak kaldırıyorsan ağırlık fazla.',
  },
  'hammer-curl': {
    steps: ['Dumbbell\'ları avuçlar karşılıklı tut.', 'Dirsekleri sabit tutarak kaldır.', 'Yavaşça indir.'],
  },
  'tricep-pushdown': {
    steps: ['Kablonun karşısında dur, dirsekler gövdeye yapışık.', 'Tutamağı kollar tam açılana kadar aşağı it.', 'Dirsekleri oynatmadan geri bırak.'],
  },
  'skull-crusher': {
    steps: ['Sehpaya uzan, barı göğsün üzerinde tut.', 'Sadece dirsekten bükerek barı alnına doğru indir.', 'Tricepsle geri it.'],
    tip: 'Dirsekler dışa açılmasın.',
  },
  squat: {
    steps: [
      'Barı üst sırtına yerleştir, ayaklar omuz genişliğinde, parmak uçları hafif dışa.',
      'Nefes al, karnı sık; kalçayı geriye ve aşağı gönder.',
      'Uyluklar en az yere paralel olana kadar in; dizler ayak yönünde.',
      'Topuklardan iterek yukarı kalk.',
    ],
    tip: 'Topuklar yerden kalkmasın, dizler içe kapanmasın.',
  },
  'front-squat': {
    steps: ['Barı ön omuzlarında taşı, dirsekler yukarıda.', 'Gövdeyi dik tutarak çömel.', 'Topuklardan iterek kalk.'],
  },
  'leg-press': {
    steps: ['Sırtın ve kalçan pedde, ayaklar platformda omuz genişliğinde.', 'Dizler göğsüne yaklaşana kadar indir.', 'Dizleri kilitlemeden it.'],
    tip: 'Kalçan pedden kalkıyorsa fazla derine iniyorsun.',
  },
  'leg-curl': { steps: ['Makineye uzan, ped topuğunun üstünde.', 'Topuklarını kalçana doğru çek.', 'Kontrollü indir.'] },
  'leg-extension': { steps: ['Makineye otur, ped ayak bileğinin önünde.', 'Bacaklarını düzleşene kadar uzat.', 'Yavaşça indir.'] },
  lunge: {
    steps: ['Dik dur, bir adım öne at.', 'Arka diz yere yaklaşana kadar çök.', 'Öndeki topuktan iterek başlangıca dön.'],
  },
  'bulgarian-split-squat': {
    steps: ['Arka ayağını sehpaya koy, öndeki ayak bir adım ileride.', 'Ön dizini bükerek çök.', 'Ön topuktan iterek kalk.'],
    tip: 'Gövdeyi hafif öne eğmek kalçayı daha çok çalıştırır.',
  },
  'hip-thrust': {
    steps: [
      'Üst sırtını sehpaya daya, barı kalça kemiğinin üstüne yerleştir (ped kullan).',
      'Ayaklar kalça genişliğinde, dizler 90° olacak mesafede.',
      'Topuklardan iterek kalçayı yukarı kaldır; tepede kalçayı 1 saniye sık.',
      'Kontrollü indir.',
    ],
    tip: 'Çeneni göğsüne yakın tut, belinle değil kalçanla kaldır.',
  },
  'glute-bridge': {
    steps: ['Sırtüstü uzan, dizler bükük, ayaklar yerde.', 'Topuklardan iterek kalçayı kaldır.', 'Tepede sık, yavaşça indir.'],
  },
  'cable-kickback': {
    steps: ['Kablo bilekliğini ayak bileğine tak, makineye dön.', 'Bacağı düz şekilde geriye it.', 'Kalçayı sıkıp kontrollü geri getir.'],
    tip: 'Belini bükme; hareket sadece kalçadan.',
  },
  'hip-abduction-machine': {
    steps: ['Makineye otur, pedler dizlerinin dışında.', 'Bacaklarını yana aç.', 'Kontrollü şekilde kapat.'],
    tip: 'Gövdeni hafif öne eğmek kalçanın üst kısmını daha çok çalıştırır.',
  },
  'calf-raise': { steps: ['Parmak uçlarınla basamakta dur.', 'Topuklarını olabildiğince yükselt.', 'Topuklar basamağın altına inene kadar in.'] },
  plank: {
    steps: ['Dirsekler omuzların altında, vücut düz bir çizgi.', 'Karnı ve kalçayı sık.', 'Belirlenen süre boyunca pozisyonu koru.'],
    tip: 'Kalçan düşüyorsa ya da çok kalkıyorsa seti bitir.',
  },
  crunch: { steps: ['Sırtüstü uzan, dizler bükük.', 'Omuzlarını yerden kaldırarak karnını sık.', 'Yavaşça indir.'] },
};

const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const byName = new Map(exerciseDatabase.map((e) => [normalize(e.name), e]));

/** Looks up an exercise by (display) name — names in programs may carry extra text. */
export function findExercise(name: string): ExerciseGuide | undefined {
  const key = normalize(name);
  const item = byName.get(key) ?? exerciseDatabase.find((e) => key.includes(normalize(e.name)));
  if (!item) return undefined;
  return {
    name: item.name,
    muscleGroup: item.muscleGroup,
    equipment: item.equipment,
    category: item.category,
    ...HOW_TO[item.id],
  };
}
