import { Router } from 'express';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { parseUploadedFile, sendBulkEmails } from '../controllers/bulk.controller.js';

const router = Router();

// Memory storage — we parse buffer directly, no disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
});

router.use(authenticateUser);

router.post('/parse', upload.single('file'), parseUploadedFile);
router.post('/send', sendBulkEmails);

export default router;
