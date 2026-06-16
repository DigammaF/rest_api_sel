import express from 'express';
import routes from './routes';
import authRoutes from './modules/auth/auth.routes';
import { requireAuth } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth route is public
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api', requireAuth, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
