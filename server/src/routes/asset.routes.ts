import { Router } from 'express';
import multer from 'multer';
import { optionalAuthenticateUser } from '../middleware/auth.middleware.js';
import { uploadAsset } from '../controllers/asset.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post('/upload', optionalAuthenticateUser, upload.single('file'), uploadAsset);

export default router;
