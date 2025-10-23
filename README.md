# 📰 NewsHub - Haber & Blog Platformu

![NewsHub Banner](https://via.placeholder.com/1000x250/007bff/ffffff?text=NewsHub+-+Haber+%26+Blog+Platformu)

> **NewsHub**, Node.js ve TypeScript kullanılarak geliştirilmiş; hem **MVC (EJS tabanlı web arayüzü)** hem de **JWT korumalı REST API** sunan, modern, güvenli ve ölçeklenebilir bir **haber & blog platformudur**.  
> Katmanlı mimari prensipleriyle tasarlanmış, kurumsal düzeyde bir Node.js projesidir.

---

## 🎯 Proje Amacı

Bu proje, **Node.js + TypeScript** kullanarak hem **REST API** hem de **EJS tabanlı web arayüzü** üzerinde **katmanlı mimari (MVC)** yapısını uygulamayı hedefler.  
Projede aşağıdaki teknik konular bütünsel olarak ele alınmıştır:

- JWT tabanlı kimlik doğrulama  
- Session tabanlı oturum yönetimi  
- Swagger API dokümantasyonu  
- MongoDB modelleme ve Mongoose ilişkileri  
- Veri doğrulama (express-validator)  
- Global hata filtreleme ve merkezi hata yönetimi  

---

## 📅 Proje Takvimi

| Başlangıç | Teslim | Süre |
|------------|---------|------|
| 13 Ekim 2025 | 22 Ekim 2025 | 10 Gün |

---

## 👥 Roller

| Rol | Açıklama |
|------|-----------|
| **Admin** | Tüm kullanıcıları ve içerikleri yönetebilir. |
| **User** | Kayıt olabilir, giriş yapabilir, yazı oluşturabilir, düzenleyebilir, silebilir, yorum yapabilir. |

---

## 🧱 Mimari Yapı

Proje **katmanlı mimari (layered architecture)** prensibiyle inşa edilmiştir.

```
src/
├── controllers/     → HTTP isteklerini karşılar, servisleri çağırır
│   ├── api/         → REST API controller'ları
│   └── web/         → EJS render eden controller'lar
├── services/        → İş mantığı (Business logic)
├── models/          → Mongoose modelleri (User, Post, Comment)
├── routes/          → Web ve API rotaları
├── views/           → EJS şablonları (login, register, dashboard, admin, vs.)
├── middlewares/     → Auth, validation, global error handler
├── utils/           → JWT, bcrypt, swagger config, eRoles vb.
├── validations/     → express-validator kuralları
└── app.ts           → Ana Express uygulaması
```

---

## 💡 Fonksiyonel Özellikler

### 🔐 Authentication & Authorization
- Kullanıcı **register** ve **login** işlemleri  
- Parola **bcrypt** ile hashlenir  
- REST API tarafında **JWT token** ile kimlik doğrulama  
- EJS tarafında **session tabanlı oturum** yönetimi  
- Rol bazlı erişim (Admin vs User)

### 📝 Post Yönetimi
- Yazı oluşturma, düzenleme, silme, listeleme  
- Yazı detay sayfası (yorum alanı ile)  
- REST API üzerinde JWT korumalı CRUD işlemleri  

### 💬 Yorum Yönetimi
- Kullanıcılar yazılara yorum yapabilir  
- Yorumlar yalnızca **Admin** veya **Post sahibi** tarafından silinebilir  

### ⚙️ Validasyon & Hata Yönetimi
- **express-validator** ile form ve API veri kontrolü  
- **Global Error Handler** ile merkezi hata yönetimi  

### 📘 Swagger Dokümantasyonu
- `/api-docs` adresinden tüm endpoint’ler interaktif şekilde test edilebilir.  

---

## 🧰 Kullanılan Teknolojiler

| Alan | Teknoloji |
|------|------------|
| Backend | Node.js, Express.js |
| Dil | TypeScript |
| Veritabanı | MongoDB + Mongoose |
| View Engine | EJS, express-ejs-layouts |
| Kimlik Doğrulama | bcrypt, JWT, express-session |
| Doğrulama | express-validator |
| Dokümantasyon | Swagger (swagger-ui-express, swagger-jsdoc) |
| Yardımcılar | dotenv, nodemon, ts-node, multer |

---

## 🧩 REST API Endpointleri

| Kategori | Endpoint | Metod | Açıklama | Yetki |
|-----------|-----------|--------|-----------|--------|
| **AUTH** | `/api/v1/auth/register` | POST | Yeni kullanıcı kaydı | Public |
|  | `/api/v1/auth/login` | POST | Kullanıcı girişi ve JWT üretimi | Public |
|  | `/api/v1/auth/profile` | GET | Kullanıcı bilgisi | JWT |
|  | `/api/v1/auth/logout` | POST | Oturumu sonlandır | JWT |
| **POSTS** | `/api/v1/posts` | CRUD | Yazı oluşturma, listeleme, düzenleme, silme | JWT |
| **COMMENTS** | `/api/v1/comments` | CRUD | Yorum ekleme, listeleme, silme | JWT |
| **CATEGORIES** | `/api/v1/categories` | CRUD | Kategori işlemleri | Admin |
| **SWAGGER** | `/api-docs` | GET | API Dokümantasyonu | Public |

---

## 📄 EJS Sayfaları

| Sayfa | Açıklama |
|--------|-----------|
| `/login` | Kullanıcı giriş formu |
| `/register` | Yeni kullanıcı kayıt formu |
| `/dashboard` | Kullanıcının kendi yazılarını listeler |
| `/posts/new` | Yeni yazı ekleme formu |
| `/posts/:id` | Yazı detay sayfası (yorumlarla birlikte) |
| `/admin` | Admin paneli (tüm kullanıcı ve içerikler) |

---

## ⚙️ Kurulum

```bash
# 1️⃣ Repo’yu klonla
git clone https://github.com/tubanursmsk/NewsHub.git
cd NewsHub

# 2️⃣ Bağımlılıkları yükle
npm install

# 3️⃣ Ortam değişkenleri (.env)
```

`.env` örneği 👇
```dotenv
MONGO_URI=mongodb://localhost:27017/NewsHubDB
SESSION_SECRET=SUPER_SECRET_SESSION_KEY
SECRET_KEY=SUPER_SECRET_JWT_KEY
PORT=3000
NODE_ENV=development
```

```bash
# 4️⃣ Geliştirme modunda çalıştır
npm start
```

Uygulama → [http://localhost:3000](http://localhost:3000)

---

## 🎓 Öğrenme Kazanımları

✅ Katmanlı mimariyi tam kapsamlı uygulama  
✅ REST API ve MVC yapılarını tek projede entegre etme  
✅ JWT ve Session farklarını deneyimleme  
✅ Mongoose ilişkilerini (`populate`) etkin kullanma  
✅ Global error handler & validation zinciri kurma  
✅ Swagger ile profesyonel API dokümantasyonu oluşturma  
✅ Kurumsal düzeyde Node.js + TypeScript proje deneyimi kazanma  

---

## 📸 Görseller

![Anasayfa](https://via.placeholder.com/800x400/007bff/ffffff?text=Anasayfa+-+NewsHub)
![Dashboard](https://via.placeholder.com/800x400/343a40/ffffff?text=Kullanici+Paneli)
![Admin Panel](https://via.placeholder.com/800x400/6c757d/ffffff?text=Admin+Paneli)
*(Gerçek proje ekran görüntülerini buraya ekleyebilirsin.)*

---

## 🧾 Lisans

MIT Lisansı © 2025 — [tubanursmsk](https://github.com/tubanursmsk)

---

## 💬 İletişim
📧 **E-posta:** tubanursmsk@example.com  
🌐 **GitHub:** [tubanursmsk](https://github.com/tubanursmsk)
