import { useEffect, useState } from 'react';
import { SupplementDto } from '../types/supplement';
import supplementService from '../services/supplementService';
import { supplementCategories, searchSupplements, SupplementItem, getSupplementsByCategory } from '../data/supplementDatabase';
import './Supplements.css';

export function Supplements() {
  const [supplements, setSupplements] = useState<SupplementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<SupplementDto | null>(null);

  // Takviye seçme state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SupplementItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementItem | null>(null);

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    timing: '',
    usageNote: ''
  });

  useEffect(() => {
    fetchSupplements();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchSupplements(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
      setActiveCategory(null);
    } else if (searchQuery.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const data = await supplementService.getSupplements();
      setSupplements(data);
    } catch (err) {
      setError('Takviyeler yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name) {
      setError('Lütfen bir takviye seçin');
      return;
    }

    try {
      const payload = {
        name: selectedSupplement ? `${selectedSupplement.icon} ${form.name}` : form.name,
        dosage: form.dosage || undefined,
        timing: form.timing || undefined,
        usageNote: form.usageNote || undefined
      };

      if (editingSupplement) {
        const updated = await supplementService.updateSupplement(editingSupplement.id, payload);
        setSupplements(supplements.map(s => s.id === editingSupplement.id ? updated : s));
      } else {
        const newSupplement = await supplementService.createSupplement(payload);
        setSupplements([...supplements, newSupplement]);
      }

      closeModal();
    } catch (err) {
      setError('Takviye kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu takviyeyi silmek istediğinizden emin misiniz?')) return;
    try {
      await supplementService.deleteSupplement(id);
      setSupplements(supplements.filter(s => s.id !== id));
    } catch (err) {
      setError('Takviye silinirken hata oluştu');
    }
  };

  const openEditModal = (supplement: SupplementDto) => {
    setEditingSupplement(supplement);
    setForm({
      name: supplement.name,
      dosage: supplement.dosage || '',
      timing: supplement.timing || '',
      usageNote: supplement.usageNote || ''
    });
    setSelectedSupplement(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplement(null);
    setSelectedSupplement(null);
    setSearchQuery('');
    setSearchResults([]);
    setActiveCategory(null);
    setForm({ name: '', dosage: '', timing: '', usageNote: '' });
  };

  const selectSupplement = (supp: SupplementItem) => {
    setSelectedSupplement(supp);
    setForm({
      ...form,
      name: supp.name,
      dosage: supp.defaultDosage,
      timing: supp.timing[0] || ''
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
      setSearchResults(getSupplementsByCategory(categoryId));
      setShowSearchResults(true);
      setSearchQuery('');
    }
  };

  if (loading) {
    return (
      <div className="supplements-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="supplements-page">
      <div className="container">
        <div className="supplements-header">
          <h1>💊 Takviye Takibi</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Yeni Takviye
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {supplements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💊</span>
            <h3>Henüz takviye kaydı yok</h3>
            <p>Aldığın takviyeleri kaydet ve takibini kolaylaştır!</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Takviye Ekle
            </button>
          </div>
        ) : (
          <div className="supplements-grid">
            {supplements.map(supplement => (
              <div key={supplement.id} className="supplement-card card">
                <div className="supplement-header">
                  <h3>{supplement.name}</h3>
                  <div className="supplement-actions">
                    <button className="btn-icon" onClick={() => openEditModal(supplement)}>
                      ✏️
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(supplement.id)}>
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="supplement-details">
                  {supplement.dosage && (
                    <div className="detail-item">
                      <span className="detail-icon">💉</span>
                      <div>
                        <span className="detail-label">Doz</span>
                        <span className="detail-value">{supplement.dosage}</span>
                      </div>
                    </div>
                  )}
                  {supplement.timing && (
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <div>
                        <span className="detail-label">Zaman</span>
                        <span className="detail-value">{supplement.timing}</span>
                      </div>
                    </div>
                  )}
                </div>

                {supplement.usageNote && (
                  <div className="supplement-note">
                    <span className="note-label">📝 Not:</span>
                    <p>{supplement.usageNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal supplement-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingSupplement ? 'Takviyeyi Düzenle' : 'Yeni Takviye'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Takviye Seçimi - Sadece yeni eklerken göster */}
              {!editingSupplement && !selectedSupplement && (
                <div className="supplement-search-section">
                  <label>Takviye Ara veya Kategori Seç</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="🔍 Takviye ara... (örn: kreatin, protein, omega)"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                      className="supplement-search-input"
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
                  <div className="supplement-categories">
                    {supplementCategories.map(cat => (
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
                      {searchResults.map(supp => (
                        <div 
                          key={supp.id} 
                          className="supplement-result-item"
                          onClick={() => selectSupplement(supp)}
                        >
                          <div className="supplement-result-left">
                            <span className="supplement-icon">{supp.icon}</span>
                            <div className="supplement-info">
                              <span className="supplement-name">{supp.name}</span>
                              <span className="supplement-benefits">{supp.benefits}</span>
                            </div>
                          </div>
                          <div className="supplement-result-right">
                            <span className="supplement-dosage">{supp.defaultDosage}</span>
                          </div>
                          <button type="button" className="add-supplement-btn">+</button>
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

              {/* Seçilen Takviye Bilgisi */}
              {selectedSupplement && (
                <div className="selected-supplement-info">
                  <div className="selected-supplement-header">
                    <span className="selected-icon">{selectedSupplement.icon}</span>
                    <div>
                      <h3>{selectedSupplement.name}</h3>
                      <p>{selectedSupplement.benefits}</p>
                    </div>
                    <button 
                      type="button" 
                      className="change-supplement-btn"
                      onClick={() => {
                        setSelectedSupplement(null);
                        setForm({ name: '', dosage: '', timing: '', usageNote: '' });
                      }}
                    >
                      Değiştir
                    </button>
                  </div>
                </div>
              )}

              {/* Form Alanları - Takviye seçildikten sonra veya düzenleme modunda göster */}
              {(selectedSupplement || editingSupplement) && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Doz</label>
                      <input
                        type="text"
                        value={form.dosage}
                        onChange={e => setForm({...form, dosage: e.target.value})}
                        placeholder="Örn: 5g, 1 scoop"
                      />
                    </div>
                    <div className="form-group">
                      <label>Kullanım Zamanı</label>
                      <select
                        value={form.timing}
                        onChange={e => setForm({...form, timing: e.target.value})}
                      >
                        <option value="">Seçin...</option>
                        {selectedSupplement ? (
                          selectedSupplement.timing.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        ) : (
                          ['Sabah', 'Öğle', 'Akşam', 'Yatmadan Önce', 'Antrenman Öncesi', 'Antrenman Sonrası'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Kullanım Notu (Opsiyonel)</label>
                    <textarea
                      value={form.usageNote}
                      onChange={e => setForm({...form, usageNote: e.target.value})}
                      placeholder="Ek notlar..."
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!selectedSupplement && !editingSupplement}
                >
                  {editingSupplement ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supplements;
