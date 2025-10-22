import { Router } from 'express';
import { create, update, approve, list, myComments, pending } from '../../controllers/api/commentRestController';
import { verifyToken, checkRole } from '../../middlewares/jwtAuth';
import { eRoles } from '../../utils/eRoles';

const router = Router();

router.post('/comments/create', verifyToken, checkRole(eRoles.User), create);
router.put('/comments/update/:id', verifyToken, checkRole(eRoles.User), update); // Veya API'deki gibi daha karmaşık rol
router.patch('/comments/approve/:id', verifyToken, checkRole(eRoles.Admin), approve);
router.get('/comments/list', list); // Herkese açık?
router.get('/comments/my-comments', verifyToken, myComments);
router.get('/comments/pending', verifyToken, checkRole(eRoles.Admin), pending);

export default router;