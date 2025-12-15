import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import './Home.css';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-glow"></div>
        </div>
        <div className="container">
          <div className="hero-content animate-slideUp">
            <h1>
              Fitness Yolculuğunu
              <br />
              <span className="gradient-text">FitLog</span> ile Takip Et
            </h1>
            <p>
              Antrenmanlarını planla, beslenmeni takip et, supplement kayıtlarını tut.
              Tüm fitness verilerini tek bir yerden yönet.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary btn-lg">
                  Dashboard'a Git
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary btn-lg">
                    Ücretsiz Başla
                  </Link>
                  <Link to="/login" className="btn-secondary btn-lg">
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title animate-slideUp">
            Neden <span className="text-accent">FitLog</span>?
          </h2>
          
          <div className="features-grid">
            <div className="feature-card animate-slideUp" style={{ animationDelay: '100ms' }}>
              <div className="feature-icon">🏋️</div>
              <h3>Antrenman Takibi</h3>
              <p>
                Kendi antrenman programlarını oluştur, egzersizleri ekle ve
                günlük performansını kaydet.
              </p>
            </div>
            
            <div className="feature-card animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="feature-icon">🥗</div>
              <h3>Beslenme Kontrolü</h3>
              <p>
                Günlük kalori ve makro değerlerini takip et, öğünlerini
                kaydet ve hedeflerine ulaş.
              </p>
            </div>
            
            <div className="feature-card animate-slideUp" style={{ animationDelay: '300ms' }}>
              <div className="feature-icon">💊</div>
              <h3>Supplement Takibi</h3>
              <p>
                Aldığın takviyeleri, dozajları ve kullanım zamanlarını
                kolayca yönet.
              </p>
            </div>
            
            <div className="feature-card animate-slideUp" style={{ animationDelay: '400ms' }}>
              <div className="feature-icon">📊</div>
              <h3>İlerleme Grafikleri</h3>
              <p>
                Verilerini görselleştir, gelişimini takip et ve
                motivasyonunu yüksek tut.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content animate-slideUp">
            <h2>Bugün Başla!</h2>
            <p>
              Fitness hedeflerine ulaşmak için ilk adımı at.
              FitLog ile antrenman ve beslenme takibi hiç bu kadar kolay olmamıştı.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary btn-lg">
                Hemen Kayıt Ol
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

