import { Router } from 'express';
import {
  getMisSolicitudes,
  getSolicitudById,
  getSolicitudes,
  patchSolicitudEstado,
  postAprobarSolicitud,
  postSolicitud
} from '../controllers/solicitud.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  aprobarSolicitudSchema,
  cambiarEstadoSolicitudSchema,
  crearSolicitudSchema,
  listarSolicitudesQuerySchema
} from '../validators/solicitud.validator.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('solicitudes', 'crear'),
  validate(crearSolicitudSchema),
  postSolicitud
);
router.get('/mias', validate(listarSolicitudesQuerySchema, 'query'), getMisSolicitudes);
router.get(
  '/',
  authorize('solicitudes', 'revisar'),
  validate(listarSolicitudesQuerySchema, 'query'),
  getSolicitudes
);
router.get('/:id', validate(idParamSchema, 'params'), getSolicitudById);
router.patch(
  '/:id/estado',
  authorize('solicitudes', 'revisar'),
  validate(idParamSchema, 'params'),
  validate(cambiarEstadoSolicitudSchema),
  patchSolicitudEstado
);
router.post(
  '/:id/aprobar',
  authorize('solicitudes', 'revisar'),
  validate(idParamSchema, 'params'),
  validate(aprobarSolicitudSchema),
  postAprobarSolicitud
);

export default router;
