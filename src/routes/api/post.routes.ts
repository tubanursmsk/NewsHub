import { Router } from 'express';
import newsRestController from '../../controllers/api/postRestController';

const router = Router();

// API projesindeki app.use('/api/v1/news', ...) satırını temel alıyoruz.
router.use('/news', newsRestController);

export default router;