import { Router } from 'express';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth.middleware.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '../controllers/template.controller.js';

const router = Router();

// Public / optional auth routes (all visitors can view templates)
router.get('/', optionalAuthenticateUser, getTemplates);
router.get('/:id', optionalAuthenticateUser, getTemplateById);

// Protected routes (creation, modification, deletion)
router.post('/', authenticateUser, createTemplate);
router.put('/:id', authenticateUser, updateTemplate);
router.delete('/:id', authenticateUser, deleteTemplate);
router.post('/:id/duplicate', authenticateUser, duplicateTemplate);

export default router;
