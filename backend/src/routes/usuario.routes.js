import { Router } from 'express';
import {
  getUsuarioById,
  getUsuarios,
  patchMiPassword,
  patchMiPerfil,
  patchUsuarioActivo
} from '../controllers/usuario.controller.js';
import {
  deleteUsuarioPermiso,
  deleteUsuarioRol,
  getUsuarioPermisosEfectivos,
  putUsuarioPermiso,
  putUsuarioRol
} from '../controllers/permiso.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  actualizarPerfilSchema,
  cambiarActivoSchema,
  cambiarPasswordSchema,
  idParamSchema,
  listarUsuariosQuerySchema
} from '../validators/usuario.validator.js';
import {
  usuarioPermisoParamsSchema,
  usuarioRolParamsSchema
} from '../validators/permiso.validator.js';

const router = Router();

router.use(authenticate);

// Rutas del usuario autenticado (deben ir antes de /:id)
router.patch('/me', validate(actualizarPerfilSchema), patchMiPerfil);
router.patch('/me/password', validate(cambiarPasswordSchema), patchMiPassword);

// Administración de usuarios
router.get(
  '/',
  authorize('usuarios', 'leer'),
  validate(listarUsuariosQuerySchema, 'query'),
  getUsuarios
);
router.get(
  '/:id',
  authorize('usuarios', 'leer'),
  validate(idParamSchema, 'params'),
  getUsuarioById
);
router.patch(
  '/:id/activo',
  authorize('usuarios', 'administrar'),
  validate(idParamSchema, 'params'),
  validate(cambiarActivoSchema),
  patchUsuarioActivo
);

// Roles y permisos del usuario
router.get(
  '/:id/permisos-efectivos',
  authorize('usuarios', 'leer'),
  validate(idParamSchema, 'params'),
  getUsuarioPermisosEfectivos
);
router.put(
  '/:id/roles/:rolId',
  authorize('roles', 'administrar'),
  validate(usuarioRolParamsSchema, 'params'),
  putUsuarioRol
);
router.delete(
  '/:id/roles/:rolId',
  authorize('roles', 'administrar'),
  validate(usuarioRolParamsSchema, 'params'),
  deleteUsuarioRol
);
router.put(
  '/:id/permisos/:permisoId',
  authorize('permisos', 'administrar'),
  validate(usuarioPermisoParamsSchema, 'params'),
  putUsuarioPermiso
);
router.delete(
  '/:id/permisos/:permisoId',
  authorize('permisos', 'administrar'),
  validate(usuarioPermisoParamsSchema, 'params'),
  deleteUsuarioPermiso
);

export default router;
