import { Router } from 'express';
import {
  getMisPagos,
  getPagos,
  patchVerificarPago,
  postPago
} from '../controllers/pago.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { pagosRateLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  crearPagoSchema,
  listarPagosQuerySchema,
  verificarPagoSchema
} from '../validators/pago.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('pagos', 'registrar'), validate(crearPagoSchema), postPago);
router.get('/mios', validate(listarPagosQuerySchema, 'query'), getMisPagos);
router.get(
  '/',
  authorize('pagos', 'verificar'),
  validate(listarPagosQuerySchema, 'query'),
  getPagos
);
router.patch(
  '/:id/verificar',
  authorize('pagos', 'verificar'),
  validate(idParamSchema, 'params'),
  validate(verificarPagoSchema),
  patchVerificarPago
);

export default router;

