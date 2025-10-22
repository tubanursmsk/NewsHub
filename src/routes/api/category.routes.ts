import { Router } from 'express';
import { add, list, update, remove } from '../../controllers/api/categoryRestController';
import { verifyToken, checkRole } from '../../middlewares/jwtAuth'; // JWT koruması
import { eRoles } from '../../utils/eRoles'; // Roller

const router = Router();

router.post('/categories/add', verifyToken, checkRole(eRoles.Admin), add);
router.get('/categories/list', verifyToken, checkRole(eRoles.Admin), list);
router.put('/categories/update/:id', verifyToken, checkRole(eRoles.Admin), update);
router.delete('/categories/delete/:id', verifyToken, checkRole(eRoles.Admin), remove);

export default router;