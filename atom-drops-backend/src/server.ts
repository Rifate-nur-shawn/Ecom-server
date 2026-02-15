import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma.client';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    const server = app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });

    const gracefulShutdown = async (signal: NodeJS.Signals) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log('Database disconnected');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();