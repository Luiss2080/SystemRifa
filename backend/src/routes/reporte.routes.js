import { Router } from 'express';
import {
  getReporteCausas,
  getReporteResumen,
  getReporteRifa
} from '../controllers/reporte.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize, exigirPropietarioORAdmin } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';

const router = Router();

router.use(authenticate, authorize('reportes', 'leer'));

router.get('/resumen', getReporteResumen);
router.get('/causas', getReporteCausas);
router.get(
  '/rifas/:id',
  validate(idParamSchema, 'params'),
  exigirPropietarioORAdmin('id'),
  getReporteRifa
);

export default router;

