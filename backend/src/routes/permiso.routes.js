import { Router } from 'express';
import {
  deletePermiso,
  getPermisos,
  patchPermiso,
  postPermiso
} from '../controllers/permiso.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  actualizarPermisoSchema,
  confirmarQuerySchema,
  crearPermisoSchema,
  listarPermisosQuerySchema
} from '../validators/permiso.validator.js';

const router = Router();

router.use(authenticate, authorize('permisos', 'administrar'));

router.get('/', validate(listarPermisosQuerySchema, 'query'), getPermisos);
router.post('/', validate(crearPermisoSchema), postPermiso);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(actualizarPermisoSchema),
  patchPermiso
);
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(confirmarQuerySchema, 'query'),
  deletePermiso
);

export default router;

