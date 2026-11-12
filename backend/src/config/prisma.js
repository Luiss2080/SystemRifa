import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const datasourceUrl = env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: datasourceUrl
    }
  },
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});
