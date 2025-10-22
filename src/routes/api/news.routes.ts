import { Router } from 'express';
import { add, update, remove, list, search } from '../../controllers/api/newsRestController';
import { verifyToken, checkRole } from '../../middlewares/jwtAuth';
import { eRoles } from '../../utils/eRoles';

const router = Router();

router.post('/news/add', verifyToken, checkRole(eRoles.Admin), add); // Rolleri REST API'ye göre ayarla
router.put('/news/update/:id', verifyToken, checkRole(eRoles.Admin), update);
router.delete('/news/delete/:id', verifyToken, checkRole(eRoles.Admin), remove);
router.get('/news/list', list); // Listeleme herkese açık olabilir? Veya verifyToken ekle
router.get('/news/search', search); // Arama herkese açık olabilir? Veya verifyToken ekle

export default router;