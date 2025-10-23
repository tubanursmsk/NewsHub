import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/web/authService'; 
import { validationResult } from 'express-validator';

/**
 * Giriş sayfasını gösterir. Hata veya eski girdi için boş değerler gönderir.
 */
export const showLoginPage = (req: Request, res: Response) => {
    try {
        res.render('auth/login', { // View dosyasını 'auth' klasörü altında arayacak
            errors: [],
            oldInput: { email: '' },
            error: null
        });
    } catch (e: any) {
        console.error("showLoginPage EJS render error:", e);
        res.status(500).send("Giriş sayfası yüklenirken bir hata oluştu: " + e.message);
    }
};

/**
 * Kayıt sayfasını gösterir. Hata veya eski girdi için boş değerler gönderir.
 */
export const showRegisterPage = (req: Request, res: Response) => {
    try {
        res.render('auth/register', { // View dosyasını 'auth' klasörü altında arayacak
            errors: [],
            oldInput: { name: '', email: '' },
            error: null
        });
    } catch (e: any) {
        console.error("showRegisterPage EJS render error:", e);
        res.status(500).send("Kayıt sayfası yüklenirken bir hata oluştu: " + e.message);
    }
};

/**
 * Kayıt formundan gelen veriyi işler.
 * Validasyon hatalarını kontrol eder.
 */
export const handleRegister = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);
    const { name, email, password } = req.body;

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        // Formu, validasyon hataları ve kullanıcının girdiği eski verilerle
        // birlikte tekrar render et. HTTP status 400 (Bad Request) gönder.
        return res.status(400).render('auth/register', {
            errors: errors.array(), // Hataları dizi olarak view'a gönder
            oldInput: { name, email }, // Parolayı geri gönderme!
            error: null // Genel hata olmadığı için null
        });
    }

    // 3. Validasyon hatası yoksa, kullanıcıyı kaydetmeye çalış
    try {
        await authService.registerUser({ name, email, password });
        // Başarılı kayıt sonrası login sayfasına yönlendir ve bir başarı mesajı ekle
        res.redirect('/login?registered=true'); 
    } catch (error: any) {
        // Servisten gelen hataları (örn: "Email zaten kullanılıyor" gibi custom error) yakala
        // veya beklenmedik veritabanı hatalarını yakala ve genel hata yöneticisine gönder
        console.error("Kayıt sırasında hata:", error); // Hatayı logla
        // Bu hatayı da formda gösterelim
        res.status(500).render('auth/register', {
             errors: [], // Validasyon hatası değil, genel hata
             oldInput: { name, email },
             error: error.message || "Kayıt sırasında beklenmedik bir hata oluştu." 
        });
        // Alternatif olarak: next(error); // Genel 500 hata sayfasına yönlendirir
    }
};

/**
 * Giriş formundan gelen veriyi işler.
 * Validasyon hatalarını ve login hatalarını kontrol eder.
 */
export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);
    const { email, password } = req.body;

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        // Formu, validasyon hataları ve eski email verisiyle tekrar render et
        return res.status(400).render('auth/login', {
            errors: errors.array(), // Hataları dizi olarak gönder
            oldInput: { email }, // Sadece email'i geri gönder
            error: null // Genel hata (catch bloğu) olmadığı için null
        });
    }

    // 3. Validasyon hatası yoksa, giriş yapmayı dene
    try {
        const user = await authService.loginUser(email, password);
        
        // Session bilgilerini ayarla
        req.session.userId = user._id.toString(); 
        req.session.eRoles = user.roles;

        // Dashboard'a yönlendir
        res.redirect('/dashboard');

    } catch (error: any) {
        // Servisten gelen hataları yakala (örn: "Email veya parola hatalı")
        // Bu hatayı da formda gösterelim
        res.status(401).render('auth/login', { // 401 Unauthorized status kodu daha uygun
             errors: [], // Validasyon hatası değil
             oldInput: { email },
             error: error.message || "Giriş sırasında beklenmedik bir hata oluştu." 
        });
        // Alternatif olarak: next(error); // Genel 500 sayfasına yönlendirir
    }
};

/**
 * Kullanıcı çıkışını yapar, session'ı sonlandırır.
 */
export const handleLogout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session sonlandırılamadı.", err);
            // Hata olsa bile kullanıcıyı güvenli bir yere yönlendir
            return res.redirect('/'); 
        }
        // Session cookie'sini temizlemek iyi bir pratiktir
        res.clearCookie('connect.sid'); // Cookie adı varsayılan olarak 'connect.sid'dir
        res.redirect('/login'); // Çıkış sonrası login sayfasına yönlendir
    });
};


/**
 * YENİ FONKSİYON
 * Giriş yapmış kullanıcının profil sayfasını gösterir.
 */
export const showProfilePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.session.userId;
        if (!userId) { // Teoride isAuthenticated bunu engeller ama garanti olsun
            return res.redirect('/login');
        }
        
        const user = await authService.getUserById(userId);
        
        if (!user) {
            // Session'da ID var ama veritabanında kullanıcı yoksa (nadir durum)
            req.session.destroy(() => {}); // Hatalı session'ı temizle
            return res.redirect('/login');
        }

        res.render('profile/view', { // profile klasörü altında view.ejs
            userData: user, // Kullanıcı verisini view'a gönder
            activePage: 'profile' // Sidebar için
        });

    } catch (error) {
        next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Profil düzenleme formunu gösterir.
 */
export const showEditProfileForm = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const userId = req.session.userId;
        if (!userId) { return res.redirect('/login'); }
        
        const user = await authService.getUserById(userId);
        
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect('/login');
        }

        res.render('profile/edit', { // profile klasörü altında edit.ejs
            userData: user,
            error: null, // Hata mesajı için başlangıç değeri
            errors: [], // Validasyon hataları için başlangıç değeri
            oldInput: { name: user.name, email: user.email }, // Formu doldurmak için
            activePage: 'profile'
        });

    } catch (error) {
        next(error);
    }
};
/**
 * Profil düzenleme formundan gelen veriyi işler.
 * Validasyon hatalarını kontrol eder.
 */
export const handleUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId;
    const { name, email } = req.body;

    if (!userId) { return res.redirect('/login'); }

    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        const user = await authService.getUserById(userId); // Mevcut veriyi tekrar çek
        return res.status(400).render('profile/edit', {
            errors: errors.array(), // Hataları gönder
            userData: user, // userData'yı tekrar gönderiyoruz
            error: null, // Genel hata yok
            oldInput: { name, email }, // Hatalı girilen veriyi geri gönder
            activePage: 'profile'
        });
    }

    // 3. Validasyon hatası yoksa, güncellemeye çalış
    try {
        await authService.updateUserProfile(userId, { name: name.trim(), email: email.trim() });
        
        // Başarılı güncelleme sonrası profil sayfasına yönlendir
        res.redirect('/profile?updated=true'); 

    } catch (error: any) {
        // Servisten gelen hataları (örn: email zaten kullanılıyor) yakala
        const user = await authService.getUserById(userId); // Mevcut veriyi tekrar çek
        res.status(400).render('profile/edit', {
             error: error.message || "Profil güncellenirken bir hata oluştu.", // Genel hatayı göster
             userData: user,
             errors: [], // Validasyon hatası değil
             oldInput: { name, email }, 
             activePage: 'profile'
        });
        // Alternatif: next(error);
    }
};