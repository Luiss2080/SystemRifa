import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(100, 'La contraseña no puede superar los 100 caracteres.')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
  .regex(/\d/, 'La contraseña debe incluir al menos un número.');

const telefonoOpcionalSchema = z
  .string()
  .trim()
  .min(6, 'El teléfono debe tener al menos 6 caracteres.')
  .max(20, 'El teléfono no puede superar los 20 caracteres.')
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val));

export const registroSchema = z.object({
  alias: z
    .string()
    .trim()
    .min(3, 'El alias debe tener al menos 3 caracteres.')
    .max(40, 'El alias no puede superar los 40 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Debe ingresar un correo electrónico válido.')
    .max(120, 'El correo no puede superar los 120 caracteres.'),
  telefono: telefonoOpcionalSchema,
  nombres: z
    .string()
    .trim()
    .min(2, 'Los nombres deben tener al menos 2 caracteres.')
    .max(80, 'Los nombres no pueden superar los 80 caracteres.'),
  apellidos: z
    .string()
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
    .max(80, 'Los apellidos no pueden superar los 80 caracteres.'),
  password: passwordSchema
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Debe ingresar un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.')
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, 'El refreshToken es obligatorio.')
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(1, 'El refreshToken es obligatorio.')
});
