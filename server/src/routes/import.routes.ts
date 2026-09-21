import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { importHtml } from '../controllers/import.controller.js';

const router = Router();

router.use(authenticateUser);

router.post('/html', importHtml);

export default router;
