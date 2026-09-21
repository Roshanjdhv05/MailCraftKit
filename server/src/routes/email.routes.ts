import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
  previewEmail,
  sendTestEmail,
  sendEmail,
  getEmailHistory,
  getEmailLogById,
} from '../controllers/email.controller.js';

const router = Router();

router.use(authenticateUser);

router.post('/preview', previewEmail);
router.post('/test', sendTestEmail);
router.post('/send', sendEmail);
router.get('/history', getEmailHistory);
router.get('/history/:id', getEmailLogById);

export default router;
