import { Router } from 'express';
import { signUpUser, signInUser } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signUpUser);
router.post('/login', signInUser);

export default router;
