import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../../middlewares/authMiddleware'; 
import { showAdminDashboard, handleDeleteUser, handleDeletePostAdmin } from '../../controllers/web/adminController';

const router = Router();

// ======================================
// ADMİN ROTALARI (GİRİŞ ve ADMİN ROLÜ GEREKLİ)
// ======================================

// Bu dosyadaki tüm rotalar için geçerli olacak middleware'leri en başa ekleyebiliriz:
router.use(isAuthenticated); // 1. Önce giriş yapmış mı diye kontrol et
router.use(isAdmin);         // 2. Sonra Admin mi diye kontrol et

// Admin Dashboard Sayfası
router.get('/dashboard', showAdminDashboard);
// YENİ: KULLANICI SİLME ROTASI
// Rota: /admin/users/USER_ID/delete şeklinde olacak
// :id parametresi silinecek kullanıcının ID'sini yakalar (req.params.id)
router.post('/users/:id/delete', handleDeleteUser);
router.post('/posts/:id/delete', handleDeletePostAdmin); 

export default router;