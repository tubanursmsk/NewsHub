# NewsHub
# NewsHub - Haber & Blog Platformu (MVC Arayüzü)

Bu proje, Node.js, TypeScript, Express ve EJS kullanarak geliştirilen NewsHub platformunun kullanıcı arayüzü (MVC) kısmıdır. Katmanlı mimari prensiplerine uygun olarak geliştirilmiştir.

## Özellikler (MVC Kısmı)

Şu ana kadar eklenen temel özellikler şunlardır:

* **Kullanıcı Yönetimi:**
    * Kullanıcı Kaydı (Register) - İsim, Email, Parola (`bcrypt` ile hashlenir)
    * Kullanıcı Girişi (Login) - Email, Parola ile (`express-session` kullanılır)
    * Kullanıcı Çıkışı (Logout) - Oturum sonlandırma
    * Roller: `User` (varsayılan) ve `Admin` rolleri tanımlı. Admin'e özel menü öğeleri gizlenir.
* **Profil Yönetimi:**
    * Profil Bilgilerini Görüntüleme (`/profile`).
    * Profil Bilgilerini Düzenleme (`/profile/edit`) - İsim ve Email güncelleme (Validasyonlu).
* **Yazı (Post) Yönetimi:**
    * Yeni Yazı Ekleme (`/posts/new`) - Başlık, İçerik, Kategori seçimi ve Resim yükleme (`multer` ile).
    * Yazıları Listeleme:
        * Anasayfa (`/`) - Tüm yazarların son yazılarını listeler.
        * Kullanıcı Paneli (`/dashboard`) - Giriş yapmış kullanıcının kendi yazılarını listeler.
        * Kategori Sayfaları (`/category/:categoryName`) - Seçilen kategoriye ait yazıları listeler.
    * Yazı Detay Sayfası (`/posts/:id`) - Yazının tam içeriğini, resmini, yazarını, tarihini ve yorumlarını gösterir.
* **Yorum Yönetimi:**
    * Yorum Ekleme - Giriş yapmış kullanıcılar yazı detay sayfasında yorum yapabilir.
* **Arayüz & Tasarım:**
    * Bootstrap 5 kullanılarak modern ve duyarlı (responsive) tasarım.
    * Ana Layout (`main.ejs`) ve Partials (`_head`, `_header`, `_sidebar`) yapısı.
    * Mobil uyumlu, açılır/kapanır sidebar (Offcanvas).
    * Medium benzeri font kullanımı (`Inter` ve `Source Serif 4`).
* **Hata Yönetimi:**
    * Özelleştirilmiş 404 ve 500 hata sayfaları (`error.ejs`).
* **Veri Doğrulama:**
    * `express-validator` kullanılarak Kayıt, Giriş ve Profil Düzenleme formlarında temel doğrulama.

## Kurulum ve Çalıştırma

1.  **Projeyi Klonlayın:**
    ```bash
    git clone <repository_url>
    cd <proje_klasoru> 
    ```
2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```
3.  **`.env` Dosyasını Oluşturun:**
    Projenin ana dizininde `.env` adında bir dosya oluşturun ve aşağıdaki değişkenleri kendi ayarlarınıza göre doldurun:
    ```.env
    # MongoDB Bağlantı Adresi
    MONGO_URI=mongodb://localhost:27017/newshub_db 

    # MongoDB Veritabanı Adı
    DB_NAME=newshub_project

    # Express Session Gizli Anahtarı (Güvenli ve rastgele bir değer girin!)
    SESSION_SECRET=cok_gizli_ve_uzun_bir_anahtar_olmalı

    # (Opsiyonel) Port Numarası (Varsayılan 3000)
    # PORT=3000

    # (Opsiyonel) Node Environment (Canlıya alırken 'production' yapın)
    # NODE_ENV=development 
    ```
4.  **Uygulamayı Başlatın (Geliştirme Modu):**
    ```bash
    npm start 
    ```
    Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## Klasör Yapısı (MVC Odaklı)

* `src/`
    * `controllers/web/`: Gelen istekleri alır, servisleri çağırır, EJS view'larını render eder.
    * `middlewares/`: İstek zincirinde araya giren fonksiyonlar (örn: `isAuthenticated`).
    * `models/`: MongoDB (Mongoose) şemaları (User, Post, Comment).
    * `routes/web/`: URL yollarını ilgili kontrolör fonksiyonlarına yönlendirir.
    * `services/`: İş mantığı ve veritabanı işlemleri burada yapılır.
    * `utils/`: Yardımcı fonksiyonlar (DB bağlantısı, dosya yükleme vb.).
    * `validations/`: `express-validator` kuralları.
    * `views/`: EJS şablon dosyaları.
        * `auth/`: Login, register sayfaları.
        * `error/`: Hata sayfaları.
        * `layouts/`: Ana sayfa şablonu (`main.ejs`).
        * `partials/`: Tekrar kullanılabilir arayüz parçaları (`_head`, `_header`, `_sidebar`).
        * `posts/`: Yazı ile ilgili sayfalar (new, detail, edit).
        * `profile/`: Profil sayfaları (view, edit).
        * `dashboard.ejs`: Kullanıcı paneli.
        * `home.ejs`: Anasayfa.
    * `app.ts`: Ana Express uygulama dosyası (middleware'ler, rota bağlantıları).
