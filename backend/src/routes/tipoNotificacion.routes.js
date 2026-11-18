import { Router } from 'express';
import {
  getTiposNotificacion,
  patchTipoNotificacion,
  postTipoNotificacion
} from '../controllers/notificacion.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  actualizarTipoNotificacionSchema,
  crearTipoNotificacionSchema
} from '../validators/notificacion.validator.js';

const router = Router();

router.use(authenticate, authorize('plantillas', 'administrar'));

router.get('/', getTiposNotificacion);
router.post('/', validate(crearTipoNotificacionSchema), postTipoNotificacion);
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(actualizarTipoNotificacionSchema),
  patchTipoNotificacion
);

export default router;

