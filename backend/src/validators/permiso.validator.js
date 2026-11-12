import { z } from 'zod';

export const crearRolSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre del rol debe tener al menos 2 caracteres.')
    .max(50, 'El nombre del rol no puede superar los 50 caracteres.')
    .transform((v) => v.toUpperCase()),
  descripcion: z
    .string()
    .trim()
    .max(200, 'La descripción no puede superar los 200 caracteres.')
    .optional()
    .nullable()
});

export const actualizarRolSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .transform((v) => v.toUpperCase())
      .optional(),
    descripcion: z.string().trim().max(200).nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });

export const crearPermisoSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  recurso: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .transform((v) => v.toLowerCase()),
  accion: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .transform((v) => v.toLowerCase()),
  estaActivo: z.boolean().optional().default(true)
});

export const actualizarPermisoSchema = z
  .object({
    nombre: z.string().trim().min(2).max(80).optional(),
    estaActivo: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.'
  });

export const listarPermisosQuerySchema = z.object({
  recurso: z.string().trim().max(50).optional(),
  estaActivo: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional()
});

export const confirmarQuerySchema = z.object({
  confirmar: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true')
});

export const usuarioRolParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  rolId: z.coerce.number().int().positive()
});

export const rolPermisoParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  permisoId: z.coerce.number().int().positive()
});

export const usuarioPermisoParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  permisoId: z.coerce.number().int().positive()
});

export const historialPermisosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  usuarioAfectadoId: z.coerce.number().int().positive().optional(),
  rolAfectadoId: z.coerce.number().int().positive().optional(),
  operacion: z.string().trim().max(40).optional()
});
