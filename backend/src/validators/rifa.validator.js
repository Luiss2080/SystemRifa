import { z } from 'zod';
import { CONSTANTES } from '../config/constantes.js';

export const listarRifasPublicasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  causaId: z.coerce.number().int().positive().optional()
});

export const listarMisRifasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.enum(['ACTIVA', 'EXTENDIDA', 'FINALIZADA']).optional()
});

export const extenderRifaSchema = z.object({
  fechaFin: z.coerce.date({ invalid_type_error: 'La nueva fechaFin no es válida.' })
});

const valorPremioSchema = z
  .union([z.number(), z.string()])
  .transform((val, ctx) => {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El valor del premio debe ser mayor a 0.'
      });
      return z.NEVER;
    }
    return num.toFixed(2);
  })
  .nullable()
  .optional();

export const crearPremioSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del premio es obligatorio.').max(120),
  descripcion: z.string().trim().max(5000).nullable().optional(),
  valor: valorPremioSchema
});

export const actualizarPremioSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120).optional(),
    descripcion: z.string().trim().max(5000).nullable().optional(),
    valor: valorPremioSchema,
    activo: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });

export const reservarTicketsSchema = z.object({
  numeros: z
    .array(z.coerce.number().int().positive('Cada número de ticket debe ser un entero positivo.'))
    .min(1, 'Debe seleccionar al menos un número de ticket.')
    .max(
      CONSTANTES.MAX_TICKETS_POR_RESERVA,
      `No puedes reservar más de ${CONSTANTES.MAX_TICKETS_POR_RESERVA} tickets por reserva.`
    )
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'La lista de números contiene valores duplicados.'
    })
});

export const liberarReservasSchema = z
  .object({
    numeros: z.array(z.coerce.number().int().positive()).min(1).optional()
  })
  .optional()
  .default({});

export const anularTicketSchema = z.object({
  motivo: z.string().trim().min(3, 'El motivo de anulación es obligatorio.').max(500)
});
