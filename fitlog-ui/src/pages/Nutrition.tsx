import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NutritionLogDto, NutritionSummaryDto } from '../types/nutrition';
import nutritionService from '../services/nutritionService';
import { foodCategories, searchFoods, FoodItem, getFoodsByCategory, foodDatabase } from '../data/foodDatabase';
import { foodMatchScore } from '../data/foodSearch';
import { customFoodsApi, type CustomFood } from '../services/trackingService';
import { useSettings } from '../store/SettingsContext';
import { useAuth } from '../store/AuthContext';
import './Nutrition.css';
import { MacroProgress } from '../components/MacroProgress';
import { localDayRange, localInputsToIso, toLocalDateInput, toLocalTimeInput } from '../utils/dateTime';
import { Beef, ChevronLeft, ChevronRight, Copy, Flame, Nut, Pencil, Plus, Salad, Search, Star, Trash2, Utensils, Wheat, X } from 'lucide-react';
import { useConfirm } from '../components/ConfirmProvider';

type Mode = 'serving' | 'gram';

interface SelectedFood {
  food: FoodItem;
  /** Servings when mode === 'serving', grams when mode === 'gram'. */
  amount: number;
  mode: Mode;
}

const CUSTOM_PREFIX = 'custom:';
const MY_FOODS = 'my-foods';

/** Grams in one serving, when the serving text tells us (e.g. "adet (60g)", "g", "ml"). */
export function gramsPerServing(food: FoodItem): number | null {
  const unit = food.servingUnit.toLowerCase();
  if (/^(g|gr|ml)\b/.test(unit)) return food.servingSize;
  const m = unit.match(/\((\d+(?:[.,]\d+)?)\s*(g|ml)\)/);
  return m ? Number(m[1].replace(',', '.')) * food.servingSize : null;
}

const multiplier = (sf: SelectedFood) => {
  if (sf.mode === 'gram') {
    const g = gramsPerServing(sf.food);
    return g ? sf.amount / g : 0;
  }
  return sf.amount;
};

const customToFood = (c: CustomFood): FoodItem => ({
  id: `${CUSTOM_PREFIX}${c.id}`,
  name: c.name,
  category: MY_FOODS,
  servingSize: c.servingSize,
  servingUnit: c.servingUnit,
  calories: c.calories,
  protein: c.protein,
  carbohydrates: c.carbohydrates,
  fat: c.fat,
  icon: '🍴',
});

const emptyCustom = { name: '', servingSize: '100', servingUnit: 'g', calories: '', protein: '', carbohydrates: '', fat: '' };

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function Nutrition() {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const { settings, update: updateSettings } = useSettings();
  const [day, setDay] = useState(() => addDays(new Date(), 0));
  const [logs, setLogs] = useState<NutritionLogDto[]>([]);
  const [summary, setSummary] = useState<NutritionSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<NutritionLogDto | null>(null);
  const [manual, setManual] = useState({ calories: '', protein: '', carbohydrates: '', fat: '' });
  const [copying, setCopying] = useState(false);

  // Food picking
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState(emptyCustom);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ date: toLocalDateInput(), time: toLocalTimeInput(), mealType: 'Öğle', notes: '' });
  const mealTypes = ['Kahvaltı', 'Ara Öğün', 'Öğle', 'Akşam', 'Gece'];

  const recentKey = user ? `recentFoods_${user.id}` : 'recentFoods';
  const allFoods = useMemo(() => [...customFoods, ...foodDatabase], [customFoods]);
  const findFood = (id: string) => allFoods.find((f) => f.id === id);
  const favorites = settings.favoriteFoodIds.map(findFood).filter(Boolean) as FoodItem[];
  const recent = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem(recentKey) || '[]') as string[]).map(findFood).filter(Boolean) as FoodItem[];
    } catch {
      return [];
    }
  }, [recentKey, allFoods, showModal]);

  const isToday = toLocalDateInput(day) === toLocalDateInput();

  useEffect(() => {
    customFoodsApi.list().then((c) => setCustomFoods(c.map(customToFood))).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDay();
  }, [day]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults([...customFoods.filter((f) => foodMatchScore(searchQuery, f.name) > 0), ...searchFoods(searchQuery)]);
      setShowSearchResults(true);
      setActiveCategory(null);
    } else if (searchQuery.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, customFoods]);

  const totals = selectedFoods.reduce(
    (t, sf) => {
      const m = multiplier(sf);
      return {
        calories: t.calories + sf.food.calories * m,
        protein: t.protein + sf.food.protein * m,
        carbohydrates: t.carbohydrates + sf.food.carbohydrates * m,
        fat: t.fat + sf.food.fat * m,
      };
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  );

  const fetchDay = async () => {
    try {
      setLoading(true);
      const { start, end } = localDayRange(day);
      const [logsData, summaryData] = await Promise.all([nutritionService.getLogs(start, end), nutritionService.getDailySummary(day)]);
      setLogs(logsData.filter((l) => toLocalDateInput(new Date(l.date)) === toLocalDateInput(day)));
      setSummary(summaryData);
      setError('');
    } catch {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const refreshSummary = async () => setSummary(await nutritionService.getDailySummary(day));

  const rememberRecent = (ids: string[]) => {
    try {
      const prev: string[] = JSON.parse(localStorage.getItem(recentKey) || '[]');
      localStorage.setItem(recentKey, JSON.stringify([...new Set([...ids, ...prev])].slice(0, 12)));
    } catch {
      /* storage unavailable */
    }
  };

  const describe = (sf: SelectedFood) =>
    sf.mode === 'gram' ? `${sf.food.name} ${Math.round(sf.amount)}g` : `${sf.food.name}${sf.amount !== 1 ? ` x${sf.amount}` : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const useManual = editingLog && selectedFoods.length === 0;
    if (!useManual && selectedFoods.length === 0) {
      setError('En az bir yiyecek eklemelisiniz');
      return;
    }

    const values = useManual
      ? {
          calories: Math.round(Number(manual.calories) || 0),
          protein: Number(manual.protein) || 0,
          carbohydrates: Number(manual.carbohydrates) || 0,
          fat: Number(manual.fat) || 0,
        }
      : {
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
        };

    const foodNames = selectedFoods.map(describe).join(', ');
    const notes = useManual ? form.notes : form.notes ? `${foodNames} | ${form.notes}` : foodNames;

    try {
      const payload = { date: localInputsToIso(form.date, form.time), ...values, mealType: form.mealType, notes };
      if (editingLog) {
        await nutritionService.updateLog(editingLog.id, payload);
      } else {
        await nutritionService.createLog(payload);
        rememberRecent(selectedFoods.map((sf) => sf.food.id));
      }
      closeModal();
      // The meal may belong to another day than the one on screen
      const savedDay = new Date(`${form.date}T00:00`);
      if (toLocalDateInput(savedDay) !== toLocalDateInput(day)) setDay(savedDay);
      else await fetchDay();
    } catch {
      setError('Kayıt oluşturulurken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: 'Öğün silinsin mi?', message: 'Bu öğün kaydı kalıcı olarak silinecek.', confirmText: 'Sil', danger: true }))) return;
    try {
      await nutritionService.deleteLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      await refreshSummary();
    } catch {
      setError('Kayıt silinirken hata oluştu');
    }
  };

  /** Copies the previous day's meals onto the day on screen, keeping their times. */
  const copyPreviousDay = async () => {
    const prev = addDays(day, -1);
    setCopying(true);
    try {
      const { start, end } = localDayRange(prev);
      const prevLogs = (await nutritionService.getLogs(start, end)).filter(
        (l) => toLocalDateInput(new Date(l.date)) === toLocalDateInput(prev),
      );
      if (prevLogs.length === 0) {
        setError('Önceki günde kopyalanacak öğün yok.');
        return;
      }
      if (!(await confirm({ title: 'Öğünler kopyalansın mı?', message: `Önceki günün ${prevLogs.length} öğünü ${day.toLocaleDateString('tr-TR')} tarihine aynı saatlerle eklenecek.`, confirmText: 'Kopyala' }))) return;
      for (const l of prevLogs) {
        await nutritionService.createLog({
          date: localInputsToIso(toLocalDateInput(day), toLocalTimeInput(new Date(l.date))),
          calories: l.calories,
          protein: l.protein,
          carbohydrates: l.carbohydrates ?? 0,
          fat: l.fat ?? 0,
          mealType: l.mealType,
          notes: l.notes,
        });
      }
      await fetchDay();
    } catch {
      setError('Öğünler kopyalanamadı.');
    } finally {
      setCopying(false);
    }
  };

  const openAddModal = () => {
    setForm({
      date: toLocalDateInput(day),
      time: isToday ? toLocalTimeInput() : '12:00',
      mealType: 'Öğle',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (log: NutritionLogDto) => {
    setEditingLog(log);
    setForm({
      date: toLocalDateInput(new Date(log.date)),
      time: toLocalTimeInput(new Date(log.date)),
      mealType: log.mealType || 'Öğle',
      notes: log.notes || '',
    });
    setManual({
      calories: String(log.calories),
      protein: String(log.protein),
      carbohydrates: String(log.carbohydrates ?? 0),
      fat: String(log.fat ?? 0),
    });
    setSelectedFoods([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLog(null);
    setSelectedFoods([]);
    setSearchQuery('');
    setSearchResults([]);
    setActiveCategory(null);
    setShowCustomForm(false);
    setCustomForm(emptyCustom);
  };

  const addFood = (food: FoodItem) => {
    const existing = selectedFoods.find((sf) => sf.food.id === food.id);
    if (existing) {
      setSelectedFoods(
        selectedFoods.map((sf) =>
          sf.food.id === food.id ? { ...sf, amount: sf.mode === 'gram' ? sf.amount + (gramsPerServing(food) ?? 0) : sf.amount + 1 } : sf,
        ),
      );
    } else {
      setSelectedFoods([...selectedFoods, { food, amount: 1, mode: 'serving' }]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const removeFood = (foodId: string) => setSelectedFoods(selectedFoods.filter((sf) => sf.food.id !== foodId));

  const setAmount = (foodId: string, amount: number) => {
    if (amount <= 0) return removeFood(foodId);
    setSelectedFoods(selectedFoods.map((sf) => (sf.food.id === foodId ? { ...sf, amount } : sf)));
  };

  const setMode = (foodId: string, mode: Mode) =>
    setSelectedFoods(
      selectedFoods.map((sf) => {
        if (sf.food.id !== foodId || sf.mode === mode) return sf;
        const g = gramsPerServing(sf.food) ?? 100;
        // keep the same amount of food when switching units
        return { ...sf, mode, amount: mode === 'gram' ? Math.round(sf.amount * g) : Math.round((sf.amount / g) * 4) / 4 || 1 };
      }),
    );

  const toggleFavorite = (food: FoodItem) => {
    const ids = settings.favoriteFoodIds.includes(food.id)
      ? settings.favoriteFoodIds.filter((id) => id !== food.id)
      : [...settings.favoriteFoodIds, food.id];
    updateSettings({ favoriteFoodIds: ids }).catch(() => setError('Favori kaydedilemedi.'));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      setActiveCategory(categoryId);
      setSearchResults(categoryId === MY_FOODS ? customFoods : getFoodsByCategory(categoryId));
      setShowSearchResults(true);
      setSearchQuery('');
    }
  };

  const saveCustomFood = async () => {
    const n = (v: string) => Number(v.replace(',', '.')) || 0;
    if (!customForm.name.trim()) return;
    try {
      const created = customToFood(
        await customFoodsApi.create({
          name: customForm.name.trim(),
          servingSize: n(customForm.servingSize) || 100,
          servingUnit: customForm.servingUnit.trim() || 'g',
          calories: n(customForm.calories),
          protein: n(customForm.protein),
          carbohydrates: n(customForm.carbohydrates),
          fat: n(customForm.fat),
        }),
      );
      setCustomFoods((c) => [created, ...c]);
      addFood(created);
      setShowCustomForm(false);
      setCustomForm(emptyCustom);
    } catch {
      setError('Yiyecek kaydedilemedi, değerleri kontrol et.');
    }
  };

  const deleteCustomFood = async (food: FoodItem) => {
    if (!(await confirm({ title: `"${food.name}" silinsin mi?`, message: 'Bu yiyecek listenden kaldırılır; eski öğün kayıtların etkilenmez.', confirmText: 'Sil', danger: true }))) return;
    try {
      await customFoodsApi.remove(food.id.slice(CUSTOM_PREFIX.length));
      setCustomFoods((c) => c.filter((f) => f.id !== food.id));
      setSearchResults((r) => r.filter((f) => f.id !== food.id));
    } catch {
      setError('Yiyecek silinemedi.');
    }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const dayTitle = isToday
    ? 'Bugün'
    : toLocalDateInput(day) === toLocalDateInput(addDays(new Date(), -1))
      ? 'Dün'
      : day.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  const quickChip = (food: FoodItem) => (
    <button key={food.id} type="button" className="quick-chip" onClick={() => addFood(food)}>
      <span aria-hidden="true">{food.icon}</span> {food.name}
    </button>
  );

  return (
    <div className="nutrition-page">
      <div className="container">
        <div className="nutrition-header">
          <h1><Salad size="1em" aria-hidden="true" /> Beslenme Takibi</h1>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size="1em" aria-hidden="true" /> Öğün Ekle
          </button>
        </div>

        <div className="day-nav">
          <button className="icon-btn" onClick={() => setDay(addDays(day, -1))} aria-label="Önceki gün">
            <ChevronLeft size={20} />
          </button>
          <div className="day-title">
            <strong>{dayTitle}</strong>
            {!isToday && <span>{day.toLocaleDateString('tr-TR')}</span>}
          </div>
          <button className="icon-btn" onClick={() => setDay(addDays(day, 1))} disabled={isToday} aria-label="Sonraki gün">
            <ChevronRight size={20} />
          </button>
          {!isToday && (
            <button className="btn-secondary today-btn" onClick={() => setDay(addDays(new Date(), 0))}>
              Bugüne dön
            </button>
          )}
          <button className="btn-secondary copy-btn" onClick={copyPreviousDay} disabled={copying}>
            <Copy size="1em" aria-hidden="true" /> {copying ? 'Kopyalanıyor…' : 'Önceki günü kopyala'}
          </button>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="nutrition-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {summary && (
              <div className="daily-summary animate-slideUp">
                <h2>{dayTitle} — Özet</h2>
                {(summary.supplementCount ?? 0) > 0 && (
                  <p className="supplement-contribution">
                    Takviyeler dahil: +{Number(summary.supplementProtein ?? 0).toFixed(0)} g protein, +{summary.supplementCalories ?? 0} kcal
                    {' · '}<Link to="/supplements">Düzenle</Link>
                  </p>
                )}
                <MacroProgress summary={summary} />
                <div className="summary-cards">
                  <div className="summary-card calories">
                    <span className="summary-icon"><Flame size="1em" aria-hidden="true" /></span>
                    <div className="summary-info">
                      <span className="summary-value">{summary.totalCalories}</span>
                      <span className="summary-label">Kalori</span>
                    </div>
                  </div>
                  <div className="summary-card protein">
                    <span className="summary-icon"><Beef size="1em" aria-hidden="true" /></span>
                    <div className="summary-info">
                      <span className="summary-value">{summary.totalProtein.toFixed(0)}g</span>
                      <span className="summary-label">Protein</span>
                    </div>
                  </div>
                  <div className="summary-card carbs">
                    <span className="summary-icon"><Wheat size="1em" aria-hidden="true" /></span>
                    <div className="summary-info">
                      <span className="summary-value">{summary.totalCarbohydrates.toFixed(0)}g</span>
                      <span className="summary-label">Karbonhidrat</span>
                    </div>
                  </div>
                  <div className="summary-card fat">
                    <span className="summary-icon"><Nut size="1em" aria-hidden="true" /></span>
                    <div className="summary-info">
                      <span className="summary-value">{summary.totalFat.toFixed(0)}g</span>
                      <span className="summary-label">Yağ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="meals-section">
              <h2>Öğünler</h2>
              {logs.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon"><Utensils size="1em" aria-hidden="true" /></span>
                  <h3>Bu güne öğün kaydı yok</h3>
                  <p>Öğün ekle ya da önceki günü kopyala.</p>
                  <button className="btn-primary" onClick={openAddModal}>
                    Öğün Ekle
                  </button>
                </div>
              ) : (
                <div className="meals-list">
                  {[...logs]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((log) => (
                      <div key={log.id} className="meal-card card">
                        <div className="meal-header">
                          <div className="meal-type-badge">{log.mealType || 'Öğün'}</div>
                          <span className="meal-date">{formatTime(log.date)}</span>
                        </div>
                        <div className="meal-macros">
                          <div className="macro">
                            <span className="macro-value">{log.calories}</span>
                            <span className="macro-label">kcal</span>
                          </div>
                          <div className="macro">
                            <span className="macro-value">{log.protein}g</span>
                            <span className="macro-label">Protein</span>
                          </div>
                          <div className="macro">
                            <span className="macro-value">{log.carbohydrates || 0}g</span>
                            <span className="macro-label">Karb</span>
                          </div>
                          <div className="macro">
                            <span className="macro-value">{log.fat || 0}g</span>
                            <span className="macro-label">Yağ</span>
                          </div>
                        </div>
                        {log.notes && <p className="meal-notes">{log.notes}</p>}
                        <div className="meal-actions">
                          <button className="btn-icon" onClick={() => openEditModal(log)} aria-label="Düzenle">
                            <Pencil size="1em" aria-hidden="true" />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(log.id)} aria-label="Sil">
                            <Trash2 size="1em" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal food-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLog ? 'Öğünü Düzenle' : 'Yeni Öğün'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="meal-date">Tarih</label>
                  <input id="meal-date" type="date" value={form.date} max={toLocalDateInput()} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="meal-time">Saat</label>
                  <input id="meal-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="meal-type">Öğün Tipi</label>
                  <select id="meal-type" value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
                    {mealTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingLog && selectedFoods.length === 0 && (
                <div className="manual-macros">
                  <label>Besin değerleri</label>
                  <div className="form-row">
                    {(
                      [
                        ['calories', 'Kalori (kcal)'],
                        ['protein', 'Protein (g)'],
                        ['carbohydrates', 'Karb (g)'],
                        ['fat', 'Yağ (g)'],
                      ] as const
                    ).map(([k, label]) => (
                      <div className="form-group" key={k}>
                        <label htmlFor={`manual-${k}`}>{label}</label>
                        <input
                          id={`manual-${k}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={manual[k]}
                          onChange={(e) => setManual({ ...manual, [k]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="hint">Değerleri düzenleyebilir ya da aşağıdan yiyecek seçerek baştan hesaplayabilirsin.</p>
                </div>
              )}

              <div className="food-search-section">
                <label htmlFor="food-search">Yiyecek Ara veya Kategori Seç</label>
                <div className="search-input-wrapper">
                  <input
                    id="food-search"
                    ref={searchInputRef}
                    type="text"
                    placeholder="Yiyecek ara... (örn: yumurta, tavuk, pilav)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    className="food-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-search"
                      aria-label="Aramayı temizle"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                    >
                      <X size="1em" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {!showSearchResults && (favorites.length > 0 || recent.length > 0) && (
                  <div className="quick-picks">
                    {favorites.length > 0 && (
                      <div>
                        <span className="quick-label"><Star size={14} aria-hidden="true" /> Favoriler</span>
                        <div className="quick-chips">{favorites.map(quickChip)}</div>
                      </div>
                    )}
                    {recent.length > 0 && (
                      <div>
                        <span className="quick-label">Son kullanılanlar</span>
                        <div className="quick-chips">{recent.slice(0, 8).map(quickChip)}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="food-categories">
                  <button type="button" className={`category-btn ${activeCategory === MY_FOODS ? 'active' : ''}`} onClick={() => handleCategoryClick(MY_FOODS)}>
                    <span className="category-icon">🍴</span>
                    <span className="category-name">Kendi Yiyeceklerim</span>
                  </button>
                  {foodCategories.map((cat) => (
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

                {activeCategory === MY_FOODS && (
                  <div className="custom-food-box">
                    {!showCustomForm ? (
                      <button type="button" className="btn-secondary" onClick={() => setShowCustomForm(true)}>
                        <Plus size="1em" aria-hidden="true" /> Yeni yiyecek oluştur
                      </button>
                    ) : (
                      <div className="custom-food-form">
                        <div className="form-row">
                          <div className="form-group wide">
                            <label htmlFor="cf-name">Ad</label>
                            <input id="cf-name" value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} placeholder="Örn: Annemin mercimek köftesi" maxLength={100} />
                          </div>
                          <div className="form-group">
                            <label htmlFor="cf-size">Porsiyon</label>
                            <input id="cf-size" type="number" min="0.1" step="0.1" value={customForm.servingSize} onChange={(e) => setCustomForm({ ...customForm, servingSize: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label htmlFor="cf-unit">Birim</label>
                            <input id="cf-unit" value={customForm.servingUnit} onChange={(e) => setCustomForm({ ...customForm, servingUnit: e.target.value })} placeholder="g, adet, dilim" maxLength={30} />
                          </div>
                        </div>
                        <div className="form-row">
                          {(
                            [
                              ['calories', 'Kalori'],
                              ['protein', 'Protein (g)'],
                              ['carbohydrates', 'Karb (g)'],
                              ['fat', 'Yağ (g)'],
                            ] as const
                          ).map(([k, label]) => (
                            <div className="form-group" key={k}>
                              <label htmlFor={`cf-${k}`}>{label}</label>
                              <input id={`cf-${k}`} type="number" min="0" step="0.1" value={customForm[k]} onChange={(e) => setCustomForm({ ...customForm, [k]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                        <div className="custom-actions">
                          <button type="button" className="btn-secondary" onClick={() => setShowCustomForm(false)}>Vazgeç</button>
                          <button type="button" className="btn-primary" onClick={saveCustomFood} disabled={!customForm.name.trim()}>Kaydet ve ekle</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((food) => {
                      const fav = settings.favoriteFoodIds.includes(food.id);
                      return (
                        <div key={food.id} className="food-result-item" onClick={() => addFood(food)}>
                          <div className="food-result-left">
                            <span className="food-icon">{food.icon}</span>
                            <div className="food-info">
                              <span className="food-name">{food.name}</span>
                              <span className="food-serving">{food.servingSize} {food.servingUnit}</span>
                            </div>
                          </div>
                          <div className="food-result-right">
                            <span className="food-calories">{food.calories} kcal</span>
                            <span className="food-macros-mini">P:{food.protein}g K:{food.carbohydrates}g Y:{food.fat}g</span>
                          </div>
                          <button
                            type="button"
                            className={`fav-btn ${fav ? 'on' : ''}`}
                            aria-label={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                            aria-pressed={fav}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(food);
                            }}
                          >
                            <Star size={16} fill={fav ? 'currentColor' : 'none'} />
                          </button>
                          {food.id.startsWith(CUSTOM_PREFIX) && (
                            <button
                              type="button"
                              className="fav-btn"
                              aria-label="Yiyeceği sil"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomFood(food);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button type="button" className="add-food-btn" aria-label={`${food.name} ekle`}>+</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showSearchResults && searchResults.length === 0 && (
                  <div className="no-results">
                    <span><Search size="1em" aria-hidden="true" /></span>
                    <p>
                      {activeCategory === MY_FOODS
                        ? 'Henüz kendi yiyeceğin yok.'
                        : `"${searchQuery}" için sonuç bulunamadı. Kendi Yiyeceklerim'den ekleyebilirsin.`}
                    </p>
                  </div>
                )}
              </div>

              {selectedFoods.length > 0 && (
                <div className="selected-foods-section">
                  <label>Seçilen Yiyecekler ({selectedFoods.length})</label>
                  <div className="selected-foods-list">
                    {selectedFoods.map((sf) => {
                      const { food, amount, mode } = sf;
                      const canGram = gramsPerServing(food) != null;
                      return (
                        <div key={food.id} className="selected-food-item">
                          <div className="selected-food-left">
                            <span className="food-icon">{food.icon}</span>
                            <div className="food-info">
                              <span className="food-name">{food.name}</span>
                              <span className="food-serving">1 porsiyon = {food.servingSize} {food.servingUnit}</span>
                            </div>
                          </div>
                          <div className="selected-food-right">
                            {mode === 'serving' ? (
                              <div className="quantity-controls">
                                <button type="button" onClick={() => setAmount(food.id, amount - 0.5)} aria-label="Azalt">−</button>
                                <span className="quantity-value">{amount}</span>
                                <button type="button" onClick={() => setAmount(food.id, amount + 0.5)} aria-label="Artır">+</button>
                              </div>
                            ) : (
                              <div className="gram-input">
                                <input
                                  type="number"
                                  min={1}
                                  value={amount}
                                  onChange={(e) => setAmount(food.id, Number(e.target.value))}
                                  aria-label={`${food.name} gram`}
                                />
                                <span>g</span>
                              </div>
                            )}
                            {canGram && (
                              <div className="mode-toggle" role="group" aria-label="Miktar birimi">
                                <button type="button" className={mode === 'serving' ? 'active' : ''} onClick={() => setMode(food.id, 'serving')}>porsiyon</button>
                                <button type="button" className={mode === 'gram' ? 'active' : ''} onClick={() => setMode(food.id, 'gram')}>gram</button>
                              </div>
                            )}
                            <span className="food-total-cal">{Math.round(food.calories * multiplier(sf))} kcal</span>
                            <button type="button" className="remove-food-btn" onClick={() => removeFood(food.id)} aria-label={`${food.name} çıkar`}>
                              <X size="1em" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="totals-bar">
                    <div className="total-item">
                      <span className="total-label">Toplam</span>
                    </div>
                    <div className="total-item calories">
                      <span className="total-value">{Math.round(totals.calories)}</span>
                      <span className="total-unit">kcal</span>
                    </div>
                    <div className="total-item">
                      <span className="total-value">{totals.protein.toFixed(1)}</span>
                      <span className="total-unit">g protein</span>
                    </div>
                    <div className="total-item">
                      <span className="total-value">{totals.carbohydrates.toFixed(1)}</span>
                      <span className="total-unit">g karb</span>
                    </div>
                    <div className="total-item">
                      <span className="total-value">{totals.fat.toFixed(1)}</span>
                      <span className="total-unit">g yağ</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="meal-notes">Ek Notlar (Opsiyonel)</label>
                <input id="meal-notes" type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Örn: Antrenman sonrası" maxLength={400} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  İptal
                </button>
                <button type="submit" className="btn-primary" disabled={!editingLog && selectedFoods.length === 0}>
                  {editingLog ? 'Güncelle' : 'Öğünü Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nutrition;
