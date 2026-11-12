import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN es obligatorio'),

    DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de MySQL'),
    DATABASE_URL_TEST: z
      .string()
      .url('DATABASE_URL_TEST debe ser una URL válida de MySQL')
      .optional(),

    JWT_ACCESS_SECRET: z
      .string()
      .min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres'),
    ACCESS_TTL: z.string().min(1).default('15m'),
    REFRESH_TTL: z.string().min(1).default('7d'),

    TARIFA_PUBLICACION: z.coerce.number().min(0).default(0),
    RESERVA_MINUTOS: z.coerce.number().int().positive().default(15),
    MAX_TICKETS_POR_RESERVA: z.coerce.number().int().positive().max(100).default(10),

    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional()
  })
  .superRefine((data, ctx) => {
    if (data.JWT_ACCESS_SECRET === data.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET debe ser distinto de JWT_ACCESS_SECRET'
      });
    }

    if (data.NODE_ENV === 'test' && !data.DATABASE_URL_TEST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL_TEST'],
        message: 'DATABASE_URL_TEST es obligatorio en entorno test'
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Error en las variables de entorno:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
