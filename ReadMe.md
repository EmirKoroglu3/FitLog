# 💪 FitLog - Fitness Tracking Application

<div align="center">

![FitLog Banner](https://img.shields.io/badge/FitLog-Fitness%20Tracker-00d4aa?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMC41NyAxNC44NkwxOC41NSAxM2ExLjUgMS41IDAgMDAtMi4xMiAwbC0uNzEuNzFhMSAxIDAgMDEtMS40MSAwbC0yLjEyLTIuMTJhMSAxIDAgMDEwLTEuNDFsLjcxLS43MWExLjUgMS41IDAgMDAwLTIuMTJsLTEuODYtMS44NmExLjUgMS41IDAgMDAtMi4xMiAwTDcuMiA3LjJhMyAzIDAgMDAwIDQuMjRsNS4zNiA1LjM2YTMgMyAwIDAwNC4yNCAwbDEuNzEtMS43MWExLjUgMS41IDAgMDAwLTIuMTJ6Ii8+PC9zdmc+)

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Modern, full-stack fitness tracking application built with Clean Architecture**

[Özellikler](#-özellikler) • [Teknolojiler](#-teknolojiler) • [Kurulum](#-kurulum) • [Ekran Görüntüleri](#-ekran-görüntüleri) • [API](#-api-endpoints)

</div>

---

## 📖 Proje Hakkında

FitLog, kullanıcıların fitness yolculuklarını kapsamlı bir şekilde takip etmelerini sağlayan modern bir web uygulamasıdır. Clean Architecture prensiplerine uygun olarak geliştirilmiş, **ASP.NET Core** backend ve **React + TypeScript** frontend ile güçlendirilmiştir.

### 🎯 Neden FitLog?

- **Antrenman Takibi**: Programlar oluştur, günleri planla, egzersizleri takip et
- **Canlı Antrenman Modu**: Set sayacı, dinlenme timer'ı, ilerleme takibi
- **Beslenme Yönetimi**: 100+ yiyecek veritabanı ile kalori ve makro takibi
- **Vücut Ölçüleri**: Kilo, yağ oranı ve çevre ölçülerini kaydet
- **Hedef & Başarılar**: Hedefler belirle, rozetler kazan
- **Su Takibi**: Günlük su tüketimini izle

---

## ✨ Özellikler

### 🏋️ Antrenman Modülü
- ✅ Özelleştirilebilir antrenman programları
- ✅ Push/Pull/Legs, Full Body gibi hazır şablonlar
- ✅ Haftalık program takvimi
- ✅ Canlı antrenman modu (timer, set takibi)
- ✅ Egzersiz veritabanı (200+ egzersiz)
- ✅ Ağırlık ve tekrar takibi

### 🥗 Beslenme Modülü
- ✅ Yemek kaydı ve kalori takibi
- ✅ Makro besin (protein, karbonhidrat, yağ) hesaplama
- ✅ 100+ yiyecek içeren veritabanı
- ✅ Öğün bazlı kayıt (kahvaltı, öğle, akşam)

### 📊 Analiz & Takip
- ✅ Antrenman takvimi ve streak takibi
- ✅ Vücut ölçüleri (kilo, boy, çevre ölçüleri)
- ✅ BMI ve BMR hesaplayıcı
- ✅ 1RM (One Rep Max) hesaplayıcı
- ✅ Kişiselleştirilmiş öneriler

### 🏆 Motivasyon
- ✅ 25+ başarı rozeti
- ✅ Hedef belirleme ve takip
- ✅ Günlük streak sistemi
- ✅ Su tüketimi takibi

### ⚙️ Diğer
- ✅ JWT Authentication
- ✅ Dark/Light tema desteği
- ✅ Responsive tasarım
- ✅ Veri dışa aktarma (JSON)

---

## 🛠 Teknolojiler

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| .NET | 9.0 | Framework |
| ASP.NET Core | 9.0 | Web API |
| Entity Framework Core | 9.0 | ORM |
| PostgreSQL | 16+ | Veritabanı |
| ASP.NET Identity | - | Kimlik Yönetimi |
| JWT Bearer | - | Authentication |
| FluentValidation | 11.x | Validation |
| Swagger/OpenAPI | - | API Dokümantasyonu |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React | 18.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| React Router | 6.x | Routing |
| Axios | 1.x | HTTP Client |
| CSS3 | - | Styling |

### Mimari
```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│                    (Controllers, Middleware)                 │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│              (DTOs, Interfaces, Validators)                  │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│         (DbContext, Repositories, Services, Identity)        │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                           │
│                   (Entities, Value Objects)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Kurulum

### Gereksinimler
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 1. Projeyi Klonla
```bash
git clone https://github.com/YOUR_USERNAME/FitLog.git
cd FitLog
```

### 2. Backend Kurulumu
```bash
# Ayar dosyasını oluştur
cp FitLog.API/appsettings.Development.json.example FitLog.API/appsettings.Development.json

# ⚠️ appsettings.Development.json dosyasını düzenle:
# - PostgreSQL şifreni gir
# - JWT Secret key oluştur (min 32 karakter)

# Paketleri yükle
dotnet restore

# Veritabanını oluştur
dotnet ef database update --project FitLog.Infrastructure --startup-project FitLog.API

# Backend'i çalıştır
cd FitLog.API
dotnet run
```

### 3. Frontend Kurulumu
```bash
cd fitlog-ui
npm install
npm run dev
```

### 4. Erişim
| Servis | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| Swagger UI | http://localhost:5001/swagger |

### 5. Production Deployment

#### Environment Variables (Önerilen)

Production ortamında hassas bilgileri ve yapılandırmaları environment variable olarak ayarlayın:

**Backend için:**
```bash
# Windows
set SendGrid__ApiKey=YOUR_SENDGRID_API_KEY
set FrontendUrl=https://yourdomain.com
set ConnectionStrings__DefaultConnection=Host=...;Database=...;Username=...;Password=...

# Linux/Mac
export SendGrid__ApiKey=YOUR_SENDGRID_API_KEY
export FrontendUrl=https://yourdomain.com
export ConnectionStrings__DefaultConnection="Host=...;Database=...;Username=...;Password=..."
```

**Öncelik Sırası:**
1. Environment Variables (en yüksek öncelik)
2. `appsettings.Production.json`
3. `appsettings.json` (fallback)

**Not:** `FrontendUrl` environment variable olarak ayarlandığında, şifre sıfırlama email'lerindeki linkler otomatik olarak production URL'ini kullanır.

---

## 📁 Proje Yapısı

```
FitLog/
├── 📂 FitLog.Domain/           # Domain Layer
│   ├── Common/                 # Base classes
│   └── Entities/               # Domain entities
│
├── 📂 FitLog.Application/      # Application Layer
│   ├── DTOs/                   # Data Transfer Objects
│   ├── Interfaces/             # Abstractions
│   ├── Services/               # Service interfaces
│   └── Validators/             # FluentValidation
│
├── 📂 FitLog.Infrastructure/   # Infrastructure Layer
│   ├── Identity/               # ASP.NET Identity
│   ├── Migrations/             # EF Core migrations
│   ├── Persistence/            # DbContext
│   ├── Repositories/           # Repository pattern
│   └── Services/               # Service implementations
│
├── 📂 FitLog.API/              # API Layer
│   ├── Controllers/            # API endpoints
│   ├── Middleware/             # Custom middleware
│   └── Services/               # API services
│
└── 📂 fitlog-ui/               # Frontend (React)
    ├── src/
    │   ├── api/                # Axios client
    │   ├── components/         # React components
    │   ├── data/               # Static data (foods, exercises)
    │   ├── pages/              # Page components
    │   ├── services/           # API services
    │   ├── store/              # Context (Auth)
    │   ├── styles/             # Global styles
    │   └── types/              # TypeScript types
    └── public/
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| POST | `/api/auth/refresh` | Token yenileme |

### Workouts
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/workout/programs` | Tüm programları getir |
| POST | `/api/workout/programs` | Yeni program oluştur |
| PUT | `/api/workout/programs/{id}` | Program güncelle |
| DELETE | `/api/workout/programs/{id}` | Program sil |
| POST | `/api/workout/days` | Gün ekle |
| POST | `/api/workout/exercises` | Egzersiz ekle |

### Nutrition
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/nutrition` | Beslenme kayıtları |
| POST | `/api/nutrition` | Yeni kayıt ekle |
| DELETE | `/api/nutrition/{id}` | Kayıt sil |

### Profile
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/profile` | Profil bilgileri |
| PUT | `/api/profile` | Profil güncelle |
| GET | `/api/profile/analysis` | BMI/BMR analizi |

---


## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👤 Geliştirici

**Emir Köroğlu**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EmirKoroglu3)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/emir-koroglu)

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ and ☕

</div>
