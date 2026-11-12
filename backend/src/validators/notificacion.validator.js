import { z } from 'zod';

export const listarNotificacionesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  noLeidas: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true')
});

export const actualizarTipoNotificacionSchema = z
  .object({
    plantillaTitulo: z.string().trim().min(1).max(150).optional(),
    plantillaMensaje: z.string().trim().min(1).optional(),
    estaActivo: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });

