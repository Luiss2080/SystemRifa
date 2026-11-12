import { z } from 'zod';

export const realizarSorteoSchema = z
  .object({
    forzar: z.boolean().optional().default(false),
    observacion: z.string().trim().max(2000).nullable().optional()
  })
  .optional()
  .default({});

export const finalizarRifaSchema = z.object({
  motivo: z.string().trim().min(3, 'El motivo es obligatorio para finalizar la rifa.').max(500)
});

export const entregarPremioSchema = z.object({
  reclamado: z.boolean({ required_error: 'El campo reclamado es obligatorio.' }),
  datosEntrega: z.string().trim().max(2000).nullable().optional()
});
