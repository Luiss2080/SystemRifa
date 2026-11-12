import { Router } from 'express';
import { getHistorialPermisos } from '../controllers/permiso.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { historialPermisosQuerySchema } from '../validators/permiso.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('permisos', 'administrar'),
  validate(historialPermisosQuerySchema, 'query'),
  getHistorialPermisos
);

export default router;

