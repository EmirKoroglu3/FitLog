# FitLog'u yayına alma

Mimari:

| Parça | Nerede | Adres |
|---|---|---|
| Frontend (React) | Vercel | `https://emirkoroglu.online` |
| API (.NET 9, Docker) | Render | `https://api.emirkoroglu.online` |
| Veritabanı (PostgreSQL) | Neon | dışarıya kapalı |

Üçü de ücretsiz plan. Render'ın ücretsiz servisi 15 dk istek gelmezse uyur; ilk istek ~30–60 sn sürer.

---

## 1. Neon — veritabanı

1. https://neon.tech → GitHub ile giriş → **New Project**
   - Name: `fitlog`, Postgres 16, Region: **AWS Europe Central (Frankfurt)**
2. Proje açılınca **Connect** → *Connection string* bölümünde ".NET" formatını seç.
   Şu biçimde bir değer verir (kendi değerin farklı olacak):
   ```
   Host=ep-xxxx.eu-central-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=********;SSL Mode=Require
   ```
3. Bu değeri bir kenara kopyala — Render'da `ConnectionStrings__DefaultConnection` olarak gireceksin.
   Tabloları elle oluşturmana gerek yok: API ilk açılışta migration'ları kendisi uygular.

## 2. Render — API

1. https://render.com → **New +** → **Blueprint** → GitHub'daki `EmirKoroglu3/FitLog` reposunu seç.
   Render repodaki `render.yaml`'ı okuyup `fitlog-api` servisini hazırlar.
2. Senden istenen gizli değerleri gir:
   - `ConnectionStrings__DefaultConnection` → Neon'dan kopyaladığın değer
   - `SendGrid__ApiKey` → şifre sıfırlama maili için (şimdilik boş bırakabilirsin; o özellik çalışmaz)
   - `SendGrid__FromEmail` → SendGrid'de doğruladığın gönderici adres
   - `JwtSettings__Secret` otomatik üretilir, dokunma.
3. **Apply** → ilk build 5–8 dk sürer. Bitince `https://fitlog-api-xxxx.onrender.com/health` adresi `Healthy` dönmeli.
4. Servis → **Settings → Custom Domains → Add** → `api.emirkoroglu.online`.
   Render sana bir **CNAME** hedefi gösterir (`fitlog-api-xxxx.onrender.com`). Bunu 4. adımda kullanacaksın.

## 3. Vercel — frontend

1. https://vercel.com → **Add New → Project** → `EmirKoroglu3/FitLog` → Import
2. **Root Directory:** `fitlog-ui` (önemli). Framework otomatik "Vite" seçilir.
3. **Environment Variables:**
   - `VITE_API_URL` = `https://api.emirkoroglu.online/api`
4. **Deploy**.
5. Proje → **Settings → Domains** → `emirkoroglu.online` ve `www.emirkoroglu.online` ekle.
   Vercel sana bir **A kaydı** (apex için, örn. `76.76.21.21`) ve `www` için **CNAME** (`cname.vercel-dns.com`) gösterir.

## 4. Türkticaret — DNS

Türkticaret paneli → **Domainlerim → emirkoroglu.online → Yönet → DNS Yönetimi**:

| Tür | Ad (Host) | Değer | Neden |
|---|---|---|---|
| A | `@` | Vercel'in verdiği IP | site |
| CNAME | `www` | `cname.vercel-dns.com` | www → site |
| CNAME | `api` | Render'ın verdiği `...onrender.com` | API |

Mevcut `@` için başka A kaydı ya da "park/yönlendirme" kaydı varsa sil. DNS'in yayılması birkaç dakika–birkaç saat sürebilir.
Vercel ve Render SSL sertifikasını DNS doğrulandıktan sonra otomatik alır.

## 5. Kontrol listesi

- [ ] `https://api.emirkoroglu.online/health` → `Healthy`
- [ ] `https://emirkoroglu.online` açılıyor, kayıt olup giriş yapılabiliyor
- [ ] Bir antrenman kaydedip **İlerleme** sayfasında görünüyor
- [ ] Telefonda "Ana ekrana ekle" ile uygulama olarak kurulabiliyor

## Uyumasını engellemek (isteğe bağlı)

https://uptimerobot.com → **New Monitor** → HTTP(s) → `https://api.emirkoroglu.online/health`, 10 dakikada bir.
Render'ın aylık 750 saati tek servisin sürekli açık kalmasına yeter.

## Sorun giderme

| Belirti | Sebep |
|---|---|
| Sitede "Network Error" | `VITE_API_URL` yanlış ya da API uyuyor (1 dk bekle) |
| Tarayıcı konsolunda CORS hatası | Render'daki `Cors__AllowedOrigins__*` site adresinle birebir aynı değil |
| Render'da build başarılı ama servis çöküyor | Connection string hatalı — Render → Logs |
| Şifre sıfırlama maili gelmiyor | `SendGrid__ApiKey` boş ya da gönderici adres doğrulanmamış |

Yerel geliştirme için: `fitlog-ui/.env.example` dosyasını `.env.local` olarak kopyala.
