import { z } from 'zod';

const metaSchema = z
  .union([z.number(), z.string()])
  .transform((val, ctx) => {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La meta debe ser un monto mayor a 0.'
      });
      return z.NEVER;
    }
    return num.toFixed(2);
  })
  .nullable()
  .optional();

export const crearCausaSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio.').max(120),
  descripcion: z.string().trim().max(5000).nullable().optional(),
  meta: metaSchema
});

export const actualizarCausaSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120).optional(),
    descripcion: z.string().trim().max(5000).nullable().optional(),
    meta: metaSchema
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });
