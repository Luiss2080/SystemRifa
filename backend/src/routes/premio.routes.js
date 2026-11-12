import { Router } from 'express';
import { deletePremio, patchPremio } from '../controllers/premio.controller.js';
import { patchEntregaPremio } from '../controllers/sorteo.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { actualizarPremioSchema } from '../validators/rifa.validator.js';
import { entregarPremioSchema } from '../validators/sorteo.validator.js';

const router = Router();

router.use(authenticate);

router.patch(
  '/:id',
  authorize('premios', 'crud'),
  validate(idParamSchema, 'params'),
  validate(actualizarPremioSchema),
  patchPremio
);
router.delete('/:id', authorize('premios', 'crud'), validate(idParamSchema, 'params'), deletePremio);

router.patch(
  '/:id/entrega',
  authorize('ganadores', 'publicar'),
  validate(idParamSchema, 'params'),
  validate(entregarPremioSchema),
  patchEntregaPremio
);

export default router;
