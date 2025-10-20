import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/authMiddleware'; 
import { showHomePage, showNewPostForm, handleCreatePost } from '../../controllers/web/postController'; 
import upload from '../../utils/fileUpload';

const router = Router();

// ANASAYFA ROTASI (Herkese açık)
router.get('/', showHomePage);

// --- GİRİŞ GEREKTİREN POST ROTALARI ---

// Yeni post oluşturma formunu GÖSTERMEK için GET isteği
// Bu rota isAuthenticated ile korunmalı
router.get('/posts/new', isAuthenticated, showNewPostForm);

// Yeni post oluşturma formunu İŞLEMEK için POST isteği
// Bu rota da isAuthenticated ile korunmalı
router.post('/posts', isAuthenticated, upload.single('postImage'), handleCreatePost);

// Diğer post rotaları (detay, dashboard vb.) daha sonra buraya eklenecek

export default router;