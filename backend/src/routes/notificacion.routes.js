import { Router } from 'express';
import {
  deleteNotificacion,
  getMisNotificaciones,
  patchMarcarLeida,
  patchMarcarTodasLeidas
} from '../controllers/notificacion.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { listarNotificacionesQuerySchema } from '../validators/notificacion.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listarNotificacionesQuerySchema, 'query'), getMisNotificaciones);
router.patch('/leidas', patchMarcarTodasLeidas);
router.patch('/:id/leida', validate(idParamSchema, 'params'), patchMarcarLeida);
router.delete('/:id', validate(idParamSchema, 'params'), deleteNotificacion);

export default router;
