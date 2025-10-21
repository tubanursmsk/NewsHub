import { Router } from 'express';
import { showLoginPage, handleLogin, showRegisterPage, handleRegister, handleLogout, showProfilePage, showEditProfileForm, handleUpdateProfile } from '../../controllers/web/authController';
import { registerValidationRules, loginValidationRules, updateProfileValidationRules } from '../../validations/auth.validator';
import { isAuthenticated } from '../../middlewares/authMiddleware'; 

const router = Router();

// --- GET Rotaları (Sayfaları Göstermek İçin) ---
// Ziyaretçiler bu sayfalara erişebilir, isAuthenticated middleware'i YOK
router.get('/login', showLoginPage);
router.get('/register', showRegisterPage);

// --- POST Rotaları ---

// Kayıt İşlemi (Validasyon eklendi)
router.post(
    '/register',
    registerValidationRules(), // <-- Validasyon middleware'i buraya eklendi
    handleRegister
);

// Giriş İşlemi (Validasyon eklendi - sonraki adımda kullanılacak)
router.post(
    '/login',
    loginValidationRules(), // <-- Login kurallarını da ekleyelim
    handleLogin
);

// --- Çıkış İşlemi (Giriş Yapmış Olmayı Gerektirir) ---
// Çıkış yapabilmek için önce giriş yapmış olmak mantıklı,
// bu yüzden buraya isAuthenticated ekleyebiliriz (opsiyonel ama önerilir).
// import { isAuthenticated } from '../../middlewares/authMiddleware'; // Eğer middleware varsa
// router.get('/logout', isAuthenticated, handleLogout); 
router.get('/logout', handleLogout); // Şimdilik korumasız bırakalım


// ======================================
// PROFİL SAYFALARI (GİRİŞ GEREKLİ)
// ======================================

// Profil Görüntüleme Sayfası
router.get('/profile', isAuthenticated, showProfilePage);

// Profil Düzenleme Formu Gösterme
router.get('/profile/edit', isAuthenticated, showEditProfileForm, updateProfileValidationRules(),);


export default router;