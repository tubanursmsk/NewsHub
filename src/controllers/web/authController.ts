import { Request, Response } from 'express';
import * as authService from '../../services/web/authService'; 

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
 */
export const handleRegister = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        await authService.registerUser({ name, email, password });
        // Başarılı kayıt sonrası login sayfasına yönlendir (veya bir başarı mesajı göster)
        res.redirect('/login?registered=true'); // Örnek: Başarı mesajı için query param ekle
    } catch (error: any) {
        // Hata durumunda kayıt sayfasını hata mesajıyla tekrar render et
        res.status(400).render('auth/register', {
            errors: [], // Henüz validasyon hatası yok
            oldInput: { name, email }, // Kullanıcının girdiği verileri geri gönder
            error: error.message // Servisten gelen hata mesajı (örn: "Email zaten kullanılıyor")
        });
    }
};

/**
 * Giriş formundan gelen veriyi işler.
 */
export const handleLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await authService.loginUser(email, password);

        // Başarılı giriş sonrası session bilgilerini ayarla
        req.session.userId = user._id.toString();
        req.session.userRole = user.role;

        // Kullanıcıyı dashboard'a (veya anasayfaya) yönlendir
        res.redirect('/dashboard'); // Şimdilik dashboard'a gitsin

    } catch (error: any) {
        // Hata durumunda giriş sayfasını hata mesajıyla tekrar render et
        res.status(400).render('auth/login', {
            errors: [],
            oldInput: { email }, // Sadece email'i geri gönderelim
            error: error.message // Servisten gelen hata mesajı (örn: "Email veya parola hatalı")
        });
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