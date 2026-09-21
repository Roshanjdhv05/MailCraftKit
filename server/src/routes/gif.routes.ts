import { Router } from 'express';
import { optionalAuthenticateUser } from '../middleware/auth.middleware.js';
import { generateGif } from '../controllers/gif.controller.js';

const router = Router();

router.post('/generate', optionalAuthenticateUser, generateGif);

export default router;
