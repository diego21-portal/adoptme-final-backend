import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/swagger.js';
import { createAdoptionRouter } from './routes/adoption.router.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export const createApp = ({ adoptionsController }) => {
  if (!adoptionsController) throw new Error('adoptionsController is required');

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '64kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'success',
      service: 'adoptme-api',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/docs.json', (_req, res) => res.status(200).json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use('/api/adoptions', createAdoptionRouter(adoptionsController));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
