import { Router } from 'express';
// API controller'ını doğru yoldan import et
import { register, login } from '../../controllers/api/userRestController';

const router = Router();

// REST API projesindeki yollara göre ayarla (/users/register değil, /auth/register)
router.post('/auth/register', register);
router.post('/auth/login', login);
// TODO: Diğer user API rotalarını buraya ekle (örn: /auth/profile)

export default router;