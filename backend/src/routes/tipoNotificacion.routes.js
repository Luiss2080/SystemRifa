import { Router } from 'express';
import {
  getTiposNotificacion,
  patchTipoNotificacion
} from '../controllers/notificacion.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { actualizarTipoNotificacionSchema } from '../validators/notificacion.validator.js';

const router = Router();

router.use(authenticate, authorize('plantillas', 'administrar'));

router.get('/', getTiposNotificacion);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(actualizarTipoNotificacionSchema),
  patchTipoNotificacion
);

export default router;
