import { z } from 'zod';
import { passwordSchema } from './auth.validator.js';

export const actualizarPerfilSchema = z
  .object({
    alias: z
      .string()
      .trim()
      .min(3, 'El alias debe tener al menos 3 caracteres.')
      .max(40, 'El alias no puede superar los 40 caracteres.')
      .optional(),
    telefono: z
      .string()
      .trim()
      .min(6, 'El teléfono debe tener al menos 6 caracteres.')
      .max(20, 'El teléfono no puede superar los 20 caracteres.')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    nombres: z
      .string()
      .trim()
      .min(2, 'Los nombres deben tener al menos 2 caracteres.')
      .max(80, 'Los nombres no pueden superar los 80 caracteres.')
      .optional(),
    apellidos: z
      .string()
      .trim()
      .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
      .max(80, 'Los apellidos no pueden superar los 80 caracteres.')
      .optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });

export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es obligatoria.'),
  passwordNueva: passwordSchema
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID debe ser un entero positivo.')
});

export const listarUsuariosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  rol: z.string().trim().max(50).optional(),
  activo: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional()
});

export const cambiarActivoSchema = z.object({
  activo: z.boolean({ required_error: 'El campo activo es obligatorio.' })
});

