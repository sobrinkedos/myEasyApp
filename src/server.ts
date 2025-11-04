import 'dotenv/config';
import app from './app';
import prisma from '@/config/database';
import redis from '@/config/redis';
import logger from '@/utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('🛑 Iniciando graceful shutdown...');

  server.close(() => {
    logger.info('✅ Servidor HTTP fechado');
  });

  // Wait for ongoing requests (max 30s)
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Close database connections
  await prisma.$disconnect();
  logger.info('✅ Prisma desconectado');

  await redis.quit();
  logger.info('✅ Redis desconectado');

  logger.info('✅ Shutdown completo');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});
