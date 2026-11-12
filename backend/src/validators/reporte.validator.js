import { z } from 'zod';

export const listarAuditoriaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entidad: z.string().trim().max(40).optional(),
  accion: z.string().trim().max(60).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional()
});

