import { Router } from 'express';
import newsRestController from '../../controllers/api/newsRestController';

const router = Router();

// API projesindeki app.use('/api/v1/news', ...) satırını temel alıyoruz.
router.use('/news', newsRestController);

export default router;