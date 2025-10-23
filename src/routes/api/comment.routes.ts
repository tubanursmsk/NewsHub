import { Router } from 'express';
import commentRestController from '../../controllers/api/commentRestController';

const router = Router();

// API projesindeki app.use('/api/v1/comments', ...) satırını temel alıyoruz.
router.use('/comments', commentRestController);

export default router;