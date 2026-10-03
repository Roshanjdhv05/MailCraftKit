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

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MailCraftKit API Server',
  });
});

// API Routes
app.use('/api/templates', templateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/import', importRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/gif', gifRoutes);

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
