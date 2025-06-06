import app from './app';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import config from './config';
import logger from './config/logger'; // Importer le logger

const PORT = config.port;
const prisma = new PrismaClient(); // Instantiate Prisma Client

async function main() {
  // Optional: Add a check to connect to the database on startup
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // Exit if database connection fails
  }
}

main();

// Graceful shutdown (optional but recommended)
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  // Close server connections here if needed
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  // Close server connections here if needed
  process.exit(0);
}); 