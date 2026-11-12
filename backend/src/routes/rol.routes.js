import { Router } from 'express';
import {
  deleteRol,
  deleteRolPermiso,
  getRoles,
  patchRol,
  postRol,
  putRolPermiso
} from '../controllers/permiso.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  actualizarRolSchema,
  crearRolSchema,
  rolPermisoParamsSchema
} from '../validators/permiso.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('roles', 'administrar'), getRoles);
router.post('/', authorize('roles', 'administrar'), validate(crearRolSchema), postRol);
router.patch(
  '/:id',
  authorize('roles', 'administrar'),
  validate(idParamSchema, 'params'),
  validate(actualizarRolSchema),
  patchRol
);
router.delete(
  '/:id',
  authorize('roles', 'administrar'),
  validate(idParamSchema, 'params'),
  deleteRol
);

router.put(
  '/:id/permisos/:permisoId',
  authorize('permisos', 'administrar'),
  validate(rolPermisoParamsSchema, 'params'),
  putRolPermiso
);
router.delete(
  '/:id/permisos/:permisoId',
  authorize('permisos', 'administrar'),
  validate(rolPermisoParamsSchema, 'params'),
  deleteRolPermiso
);

export default router;
