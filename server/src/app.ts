import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.ts';
import { globalErrorHandler } from './middleware/global-error.middleware.ts';
import logger, { httpLogger } from './lib/logger.ts';

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the configured HTTP logger
app.use(httpLogger);

app.use('/api', routes);

// Global error handling middleware (MUST be last)
app.use(globalErrorHandler);

app.listen(port, () => {
  logger.info(`🚀 Server started on port ${port}`);
});

