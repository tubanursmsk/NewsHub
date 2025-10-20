import { Router } from 'express';
// Controller fonksiyonlarını import et
import { 
    showLoginPage, 
    handleLogin, 
    showRegisterPage, 
    handleRegister, 
    handleLogout 
} from '../../controllers/web/authController';

const router = Router();

// --- GET Rotaları (Sayfaları Göstermek İçin) ---
// Ziyaretçiler bu sayfalara erişebilir, isAuthenticated middleware'i YOK
router.get('/login', showLoginPage);
router.get('/register', showRegisterPage);

// --- POST Rotaları (Formları İşlemek İçin) ---
// Ziyaretçiler bu işlemleri yapabilir, isAuthenticated middleware'i YOK
router.post('/login', handleLogin);
router.post('/register', handleRegister);

// --- Çıkış İşlemi (Giriş Yapmış Olmayı Gerektirir) ---
// Çıkış yapabilmek için önce giriş yapmış olmak mantıklı,
// bu yüzden buraya isAuthenticated ekleyebiliriz (opsiyonel ama önerilir).
// import { isAuthenticated } from '../../middlewares/authMiddleware'; // Eğer middleware varsa
// router.get('/logout', isAuthenticated, handleLogout); 
router.get('/logout', handleLogout); // Şimdilik korumasız bırakalım

export default router;