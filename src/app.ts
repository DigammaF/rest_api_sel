import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import authRoutes from './modules/auth/auth.routes.ts';
import { requireAuth } from './middleware/auth.middleware';
import { swaggerSpec } from './config/swagger';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI (public)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth route is public
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api', requireAuth, routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
