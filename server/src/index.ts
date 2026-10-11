import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import templateRoutes from './routes/template.routes.js';
import emailRoutes from './routes/email.routes.js';
import importRoutes from './routes/import.routes.js';
import profileRoutes from './routes/profile.routes.js';
import authRoutes from './routes/auth.routes.js';
import bulkRoutes from './routes/bulk.routes.js';
import adminRoutes from './routes/admin.routes.js';
import assetRoutes from './routes/asset.routes.js';
import gifRoutes from './routes/gif.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const ALLOWED_ORIGINS = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mailcraftkit.vercel.app',
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or curl)
    if (!origin) return callback(null, true);
    // Allow configured origins, any vercel.app preview or production URL, and localhost
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MailCraftKit API Server',
  });
});

// API Routes
app.use(['/api/templates', '/templates'], templateRoutes);
app.use(['/api/email', '/email'], emailRoutes);
app.use(['/api/import', '/import'], importRoutes);
app.use(['/api/profile', '/profile'], profileRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/bulk', '/bulk'], bulkRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/assets', '/assets'], assetRoutes);
app.use(['/api/gif', '/gif'], gifRoutes);

// Global Error Handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;

// Start server when not running in a serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 MailCraftKit Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  });
}
