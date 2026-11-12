import { z } from 'zod';

export const crearPagoSchema = z.object({
  rifaId: z.coerce.number().int().positive('rifaId inválido.'),
  ticketIds: z
    .array(z.coerce.number().int().positive('ticketId inválido.'))
    .min(1, 'Debe incluir al menos un ticket.')
    .max(50, 'Cantidad máxima de tickets por pago excedida.')
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'La lista de ticketIds contiene valores duplicados.'
    }),
  metodo: z.string().trim().min(2, 'El método de pago es obligatorio.').max(40),
  referencia: z.string().trim().max(80).nullable().optional()
});

export const listarPagosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.enum(['PENDIENTE', 'CONFIRMADO', 'RECHAZADO']).optional(),
  rifaId: z.coerce.number().int().positive().optional()
});

export const verificarPagoSchema = z
  .object({
    aprobado: z.boolean({ required_error: 'El campo aprobado es obligatorio.' }),
    motivo: z.string().trim().max(500).nullable().optional()
  })
  .superRefine((data, ctx) => {
    if (data.aprobado === false && (!data.motivo || data.motivo.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['motivo'],
        message: 'Debe indicar un motivo obligatorio al rechazar un pago.'
      });
    }
  });
