import { Router } from 'express';
import { optionalAuthenticateUser } from '../middleware/auth.middleware.js';
import {
  getOverviewStats,
  getUsersList,
  getAdminTemplates,
  importTemplate,
  deleteAdminTemplate,
  getEmailLogs,
} from '../controllers/admin.controller.js';

const router = Router();

// Apply optional authentication (allows admin features in local/dev mode as well)
router.use(optionalAuthenticateUser);

router.get('/stats', getOverviewStats);
router.get('/users', getUsersList);
router.get('/templates', getAdminTemplates);
router.post('/templates/import', importTemplate);
router.delete('/templates/:id', deleteAdminTemplate);
router.get('/logs', getEmailLogs);

export default router;
