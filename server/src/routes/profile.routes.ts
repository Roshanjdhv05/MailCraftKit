import { Router } from 'express';
import { getProfile, updateSmtpSettings } from '../controllers/profile.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateUser, getProfile);
router.put('/', authenticateUser, updateSmtpSettings);
router.post('/smtp', authenticateUser, updateSmtpSettings);

export default router;
