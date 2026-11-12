import { prisma } from '../../src/config/prisma.js';
import { env } from '../../src/config/env.js';
import { runSeed } from '../../prisma/seed.js';
import { resetRateLimiters } from '../../src/middlewares/rateLimit.js';

/**
 * Limpia todas las tablas de la base de datos de pruebas (excluyendo _prisma_migrations),
 * reinicia los limitadores de tasa en memoria y vuelve a ejecutar el seed base idempotente.
 */
export async function resetDb() {
  if (env.NODE_ENV !== 'test') {
    throw new Error('resetDb solo puede ejecutarse en entorno test.');
  }

  resetRateLimiters();

  const tables = await prisma.$queryRaw`
    SELECT TABLE_NAME AS tableName
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      AND TABLE_NAME <> '_prisma_migrations'
  `;

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
    try {
      for (const { tableName } of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\``);
      }
    } finally {
      await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  await runSeed(prisma);
}
