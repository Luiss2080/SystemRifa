import { z } from 'zod';

const precioTicketSchema = z.union([z.number(), z.string()]).transform((val, ctx) => {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El precio del ticket debe ser mayor a 0.'
    });
    return z.NEVER;
  }
  return num.toFixed(2);
});

export const crearSolicitudSchema = z
  .object({
    nombre: z.string().trim().min(3, 'El nombre de la rifa es obligatorio.').max(120),
    descripcion: z.string().trim().max(5000).nullable().optional(),
    precioTicket: precioTicketSchema,
    cantidadTickets: z.coerce
      .number()
      .int()
      .min(1, 'Debe haber al menos 1 ticket.')
      .max(10000, 'La cantidad máxima permitida es 10000 tickets.'),
    fechaInicio: z.coerce.date({ invalid_type_error: 'fechaInicio inválida.' }),
    fechaFin: z.coerce.date({ invalid_type_error: 'fechaFin inválida.' }),
    causaId: z.coerce.number().int().positive().nullable().optional()
  })
  .superRefine((data, ctx) => {
    if (data.fechaFin <= data.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'La fecha de finalización debe ser posterior a la fecha de inicio.'
      });
    }
    if (data.fechaFin <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'La fecha de finalización debe ser futura.'
      });
    }
  });

export const listarSolicitudesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  estado: z
    .enum(['REVISION', 'ESPERANDO_PAGO', 'PAGO_CONFIRMADO', 'APROBADA', 'RECHAZADA'])
    .optional()
});

export const cambiarEstadoSolicitudSchema = z.object({
  estado: z.enum(['REVISION', 'ESPERANDO_PAGO', 'PAGO_CONFIRMADO', 'APROBADA', 'RECHAZADA']),
  referenciaPago: z.string().trim().max(80).nullable().optional(),
  observacion: z.string().trim().max(2000).nullable().optional()
});

export const aprobarSolicitudSchema = z
  .object({
    nombre: z.string().trim().min(3).max(120).optional(),
    descripcion: z.string().trim().max(5000).nullable().optional(),
    precioTicket: precioTicketSchema.optional(),
    cantidadTickets: z.coerce.number().int().min(1).max(10000).optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
    causaId: z.coerce.number().int().positive().nullable().optional(),
    observacion: z.string().trim().max(2000).nullable().optional()
  })
  .optional()
  .default({});
