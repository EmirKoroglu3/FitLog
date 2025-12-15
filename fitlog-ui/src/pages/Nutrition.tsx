import { useEffect, useState, useRef } from 'react';
import { NutritionLogDto, NutritionSummaryDto } from '../types/nutrition';
import nutritionService from '../services/nutritionService';
import { foodCategories, searchFoods, FoodItem, getFoodsByCategory } from '../data/foodDatabase';
import './Nutrition.css';

interface SelectedFood {
  food: FoodItem;
  quantity: number; // çarpan (1 = 1 porsiyon, 2 = 2 porsiyon, vs.)
}

export function Nutrition() {
  const [logs, setLogs] = useState<NutritionLogDto[]>([]);
  const [summary, setSummary] = useState<NutritionSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<NutritionLogDto | null>(null);

  // Yeni yiyecek seçme state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'Öğle',
    notes: ''
  });

  const mealTypes = ['Kahvaltı', 'Ara Öğün', 'Öğle', 'Akşam', 'Gece'];

  useEffect(() => {
    fetchData();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchFoods(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
      setActiveCategory(null);
    } else if (searchQuery.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Toplam besin değerlerini hesapla
  const calculateTotals = () => {
    return selectedFoods.reduce(
      (totals, { food, quantity }) => ({
        calories: totals.calories + food.calories * quantity,
        protein: totals.protein + food.protein * quantity,
        carbohydrates: totals.carbohydrates + food.carbohydrates * quantity,
        fat: totals.fat + food.fat * quantity,
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, summaryData] = await Promise.all([
        nutritionService.getLogs(),
        nutritionService.getDailySummary()
      ]);
      setLogs(logsData);
      setSummary(summaryData);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFoods.length === 0) {
      setError('En az bir yiyecek eklemelisiniz');
      return;
    }

    try {
      // Seçilen yiyeceklerin isimlerini notlara ekle
      const foodNames = selectedFoods.map(sf => 
        `${sf.food.icon} ${sf.food.name}${sf.quantity > 1 ? ` x${sf.quantity}` : ''}`
      ).join(', ');

      const payload = {
        date: new Date(form.date).toISOString(),
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        mealType: form.mealType,
        notes: form.notes ? `${foodNames} | ${form.notes}` : foodNames
      };

      if (editingLog) {
        const updated = await nutritionService.updateLog(editingLog.id, payload);
        setLogs(logs.map(l => l.id === editingLog.id ? updated : l));
      } else {
        const newLog = await nutritionService.createLog(payload);
        setLogs([newLog, ...logs]);
      }

      // Refresh summary
      const summaryData = await nutritionService.getDailySummary();
      setSummary(summaryData);

      closeModal();
    } catch (err) {
      setError('Kayıt oluşturulurken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    try {
      await nutritionService.deleteLog(id);
      setLogs(logs.filter(l => l.id !== id));
      const summaryData = await nutritionService.getDailySummary();
      setSummary(summaryData);
    } catch (err) {
      setError('Kayıt silinirken hata oluştu');
    }
  };

  const openEditModal = (log: NutritionLogDto) => {
    setEditingLog(log);
    setForm({
      date: new Date(log.date).toISOString().split('T')[0],
      mealType: log.mealType || 'Öğle',
      notes: log.notes || ''
    });
    // Düzenleme modunda manuel değerler için boş başlat
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
    setForm({
      date: new Date().toISOString().split('T')[0],
      mealType: 'Öğle',
      notes: ''
    });
  };

  const addFood = (food: FoodItem) => {
    // Aynı yiyecek zaten ekliyse miktarını artır
    const existing = selectedFoods.find(sf => sf.food.id === food.id);
    if (existing) {
      setSelectedFoods(selectedFoods.map(sf => 
        sf.food.id === food.id 
          ? { ...sf, quantity: sf.quantity + 1 }
          : sf
      ));
    } else {
      setSelectedFoods([...selectedFoods, { food, quantity: 1 }]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter(sf => sf.food.id !== foodId));
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFood(foodId);
      return;
    }
    setSelectedFoods(selectedFoods.map(sf => 
      sf.food.id === foodId ? { ...sf, quantity } : sf
    ));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setSearchResults([]);
    } else {
      setActiveCategory(categoryId);
      setSearchResults(getFoodsByCategory(categoryId));
      setShowSearchResults(true);
      setSearchQuery('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="nutrition-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="nutrition-page">
      <div className="container">
        <div className="nutrition-header">
          <h1>🥗 Beslenme Takibi</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Öğün Ekle
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Günlük Özet */}
        {summary && (
          <div className="daily-summary animate-slideUp">
            <h2>Bugünün Özeti</h2>
            <div className="summary-cards">
              <div className="summary-card calories">
                <span className="summary-icon">🔥</span>
                <div className="summary-info">
                  <span className="summary-value">{summary.totalCalories}</span>
                  <span className="summary-label">Kalori</span>
                </div>
              </div>
              <div className="summary-card protein">
                <span className="summary-icon">🥩</span>
                <div className="summary-info">
                  <span className="summary-value">{summary.totalProtein.toFixed(0)}g</span>
                  <span className="summary-label">Protein</span>
                </div>
              </div>
              <div className="summary-card carbs">
                <span className="summary-icon">🍚</span>
                <div className="summary-info">
                  <span className="summary-value">{summary.totalCarbohydrates.toFixed(0)}g</span>
                  <span className="summary-label">Karbonhidrat</span>
                </div>
              </div>
              <div className="summary-card fat">
                <span className="summary-icon">🥑</span>
                <div className="summary-info">
                  <span className="summary-value">{summary.totalFat.toFixed(0)}g</span>
                  <span className="summary-label">Yağ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Öğün Listesi */}
        <div className="meals-section">
          <h2>Öğünler</h2>
          {logs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h3>Henüz öğün kaydı yok</h3>
              <p>İlk öğününü ekleyerek başla!</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Öğün Ekle
              </button>
            </div>
          ) : (
            <div className="meals-list">
              {logs.map(log => (
                <div key={log.id} className="meal-card card">
                  <div className="meal-header">
                    <div className="meal-type-badge">{log.mealType || 'Öğün'}</div>
                    <span className="meal-date">{formatDate(log.date)}</span>
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
                    <button className="btn-icon" onClick={() => openEditModal(log)}>✏️</button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(log.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal food-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingLog ? 'Öğünü Düzenle' : 'Yeni Öğün'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Tarih ve Öğün Tipi */}
              <div className="form-row">
                <div className="form-group">
                  <label>Tarih</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Öğün Tipi</label>
                  <select
                    value={form.mealType}
                    onChange={e => setForm({...form, mealType: e.target.value})}
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Yiyecek Arama */}
              <div className="food-search-section">
                <label>Yiyecek Ara veya Kategori Seç</label>
                <div className="search-input-wrapper">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="🔍 Yiyecek ara... (örn: yumurta, tavuk, pilav)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    className="food-search-input"
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
                <div className="food-categories">
                  {foodCategories.map(cat => (
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
                    {searchResults.map(food => (
                      <div 
                        key={food.id} 
                        className="food-result-item"
                        onClick={() => addFood(food)}
                      >
                        <div className="food-result-left">
                          <span className="food-icon">{food.icon}</span>
                          <div className="food-info">
                            <span className="food-name">{food.name}</span>
                            <span className="food-serving">{food.servingSize} {food.servingUnit}</span>
                          </div>
                        </div>
                        <div className="food-result-right">
                          <span className="food-calories">{food.calories} kcal</span>
                          <span className="food-macros-mini">
                            P:{food.protein}g K:{food.carbohydrates}g Y:{food.fat}g
                          </span>
                        </div>
                        <button type="button" className="add-food-btn">+</button>
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

              {/* Seçilen Yiyecekler */}
              {selectedFoods.length > 0 && (
                <div className="selected-foods-section">
                  <label>Seçilen Yiyecekler ({selectedFoods.length})</label>
                  <div className="selected-foods-list">
                    {selectedFoods.map(({ food, quantity }) => (
                      <div key={food.id} className="selected-food-item">
                        <div className="selected-food-left">
                          <span className="food-icon">{food.icon}</span>
                          <div className="food-info">
                            <span className="food-name">{food.name}</span>
                            <span className="food-serving">{food.servingSize} {food.servingUnit}</span>
                          </div>
                        </div>
                        <div className="selected-food-right">
                          <div className="quantity-controls">
                            <button 
                              type="button"
                              onClick={() => updateFoodQuantity(food.id, quantity - 1)}
                            >
                              −
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                              type="button"
                              onClick={() => updateFoodQuantity(food.id, quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="food-total-cal">{Math.round(food.calories * quantity)} kcal</span>
                          <button 
                            type="button" 
                            className="remove-food-btn"
                            onClick={() => removeFood(food.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Toplam Besin Değerleri */}
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

              {/* Notlar */}
              <div className="form-group">
                <label>Ek Notlar (Opsiyonel)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Örn: Antrenman sonrası"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={selectedFoods.length === 0}
                >
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
