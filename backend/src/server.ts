import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { testConnection } from './config/database';
import swaggerSpec from './config/swagger';
import { errorHandler, notFound } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import universityRoutes from './routes/university.routes';
import candidateProfileRoutes from './routes/candidate-profile.routes';
import adminRoutes from './routes/admin.routes';
import adminFullRoutes from './routes/admin-full.routes';
import candidateRoutes from './routes/candidate.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/candidate', candidateProfileRoutes);
app.use('/api/candidate-applications', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminFullRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start
const start = async (): Promise<void> => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();

export default app;
