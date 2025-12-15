FITLOG – CLEAN ARCHITECTURE FITNESS TRACKING APPLICATION
========================================================

## 🚀 Hızlı Kurulum (Quick Start)

### Gereksinimler
- .NET 9 SDK
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Projeyi Klonla
```bash
git clone https://github.com/YOUR_USERNAME/FitLog.git
cd FitLog
```

### 2. Backend Kurulumu
```bash
# appsettings.Development.json dosyasını oluştur
cp FitLog.API/appsettings.Development.json.example FitLog.API/appsettings.Development.json

# Dosyayı düzenleyip kendi PostgreSQL şifreni ve JWT Secret key'ini gir
# NOT: JWT Secret en az 32 karakter olmalı!

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
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- Swagger: http://localhost:5001/swagger

---

## ⚠️ Güvenlik Notu
`appsettings.Development.json` dosyası .gitignore'da olduğu için GitHub'a yüklenmez.
Kendi şifrelerinizi güvenle bu dosyaya yazabilirsiniz.

---

0) PROJE AMACI VE GENEL TANIM
--------------------------------------------------------
FitLog; kullanıcıların antrenman programlarını, beslenmelerini ve supplement
kullanımlarını takip edebildiği bir fitness tracking uygulamasıdır.

Frontend: React + TypeScript
Backend: ASP.NET Core Web API (C#)
Mimari: Clean Architecture
Database: PostgreSQL
Auth: JWT + ASP.NET Identity

Bu proje; kurumsal mimari, temiz kod, katmanlı yapı ve modern frontend-backend
iletişimini öğrenmek ve göstermek amacıyla geliştirilir.

Hedef:
- Clean Architecture’ı gerçek projede uygulamak
- Orta–üst seviye full-stack proje çıkarmak
- CV + GitHub için güçlü referans oluşturmak


1) GENEL MİMARİ VE TEKNOLOJİLER
--------------------------------------------------------
Backend:
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- ASP.NET Identity
- JWT Authentication

Frontend:
- React
- TypeScript
- Vite
- Axios
- React Router
- Chart.js

Clean Architecture Katmanları:
- Domain
- Application
- Infrastructure
- API

Bağımlılık yönü:
API -> Application -> Domain
Infrastructure -> Application
Domain hiçbir katmana bağlı değildir.


2) BACKEND SOLUTION OLUŞTURMA
--------------------------------------------------------
Adımlar:

1. Boş solution oluştur:
   dotnet new sln -n FitLog

2. Projeleri oluştur:
   dotnet new classlib -n FitLog.Domain
   dotnet new classlib -n FitLog.Application
   dotnet new classlib -n FitLog.Infrastructure
   dotnet new webapi -n FitLog.API

3. Solution’a ekle:
   dotnet sln add FitLog.Domain
   dotnet sln add FitLog.Application
   dotnet sln add FitLog.Infrastructure
   dotnet sln add FitLog.API


3) PROJELER ARASI REFERANSLAR
--------------------------------------------------------
Referans kuralları:

- FitLog.Application -> FitLog.Domain
- FitLog.Infrastructure -> FitLog.Application
- FitLog.API -> FitLog.Application
- FitLog.API -> FitLog.Infrastructure

Domain:
- Hiçbir projeye referans vermez
- Tamamen bağımsızdır


4) DOMAIN KATMANI (CORE BUSINESS)
--------------------------------------------------------
Amaç:
- Saf iş kuralları
- Framework bağımsız kod
- Entity tanımları

Kurallar:
- EF Core attribute KULLANILMAZ
- Controller, DbContext, DTO YOK
- Sadece iş mantığı vardır

Oluşturulacak yapılar:

BaseEntity:
- Id (Guid)
- CreatedDate
- UpdatedDate

Entity’ler:
- User
  - Id
  - Email
  - Name
  - Surname

- WorkoutProgram
  - Id
  - UserId
  - Name
  - Description

- WorkoutDay
  - Id
  - WorkoutProgramId
  - DayOfWeek

- Exercise
  - Id
  - WorkoutDayId
  - Name
  - SetCount
  - Reps
  - Weight

- NutritionLog
  - Id
  - UserId
  - Calories
  - Protein
  - Date

- Supplement
  - Id
  - UserId
  - Name
  - UsageNote


5) APPLICATION KATMANI (USE CASE LAYER)
--------------------------------------------------------
Amaç:
- İş akışlarını yönetmek
- Use-case’leri yazmak
- DTO, Command, Query yapısını kurmak

Klasör yapısı:

Application
- Interfaces
- DTOs
- Features
  - Auth
  - Workouts
  - Nutrition
- Validators
- Mappings

Kurallar:
- Entity’ler API’ye dönmez
- DTO zorunlu
- Business logic burada yazılır


6) DTO KULLANIMI
--------------------------------------------------------
Her entity için ayrı DTO’lar yazılır:

- CreateRequest DTO
- UpdateRequest DTO
- Response DTO

Örnek:
- CreateWorkoutProgramRequest
- WorkoutProgramResponse

Controller asla Entity dönmez.


7) CQRS YAPISI
--------------------------------------------------------
Command:
- Veri değiştirir
- Create, Update, Delete işlemleri

Query:
- Sadece veri okur
- Get, List işlemleri

Örnek Command’ler:
- CreateWorkoutProgramCommand
- AddExerciseCommand
- CreateNutritionLogCommand

Örnek Query’ler:
- GetUserWorkoutProgramsQuery
- GetWorkoutDetailQuery


8) VALIDATION
--------------------------------------------------------
- FluentValidation kullanılır
- Tüm input doğrulamaları burada yapılır
- Controller içinde validation yapılmaz

Örnek:
- CreateWorkoutProgramCommandValidator
- RegisterUserCommandValidator


9) INFRASTRUCTURE KATMANI
--------------------------------------------------------
Amaç:
- Database
- EF Core
- Identity
- Repository implementasyonları

Burada yapılacaklar:
- PostgreSQL bağlantısı
- DbContext oluşturma
- Repository’leri implement etme
- Identity ve JWT altyapısı


10) DATABASE VE EF CORE
--------------------------------------------------------
- PostgreSQL kullanılır
- Npgsql provider eklenir
- FitLogDbContext oluşturulur
- DbSet’ler tanımlanır
- Fluent API ile mapping yazılır
- Migration oluşturulur

DbContext API’de direkt kullanılmaz.


11) REPOSITORY PATTERN
--------------------------------------------------------
- Interface Application katmanında
- Implementasyon Infrastructure katmanında
- Dependency Injection kullanılır

Amaç:
- DbContext bağımlılığını izole etmek
- Test edilebilirlik sağlamak


12) AUTHENTICATION & IDENTITY
--------------------------------------------------------
- ASP.NET Core Identity kurulur
- User IdentityUser’dan türetilir
- JWT Token üretilir
- Refresh Token opsiyonel

Auth endpoint’leri:
- Register
- Login

Yetkilendirme:
- [Authorize] attribute
- Role-based auth (opsiyonel)


13) API KATMANI
--------------------------------------------------------
Amaç:
- HTTP endpoint’ler
- Request / Response yönetimi

Controller’lar:
- AuthController
- WorkoutController
- NutritionController

Middleware:
- Global Exception Handling
- JWT Authentication
- Authorization
- Logging

Swagger:
- JWT destekli Swagger
- Tüm endpoint’ler dokümante edilir


14) FRONTEND – REACT + TYPESCRIPT
--------------------------------------------------------
Kurulum:
npm create vite@latest fitlog-ui -- --template react-ts

Klasör yapısı:

src
- api
- components
- pages
- hooks
- services
- types
- utils
- store
- routes

Frontend’de yapılacaklar:
- Login / Register sayfaları
- Dashboard
- Workout programları
- Nutrition takibi
- Progress chart’ları

API entegrasyonu:
- Axios instance
- JWT interceptor
- Protected routes
- Error handling
- Loading state

--------------------------------------------------------
BU NOKTAYA KADAR OLAN KISIM PROJENİN %80’İNİ OLUŞTURUR.
BURADAN SONRASI EKSTRA VE GELİŞTİRME ADIMLARIDIR.
========================================================
