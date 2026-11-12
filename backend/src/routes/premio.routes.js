import { Router } from 'express';
import { deletePremio, patchPremio } from '../controllers/premio.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { actualizarPremioSchema } from '../validators/rifa.validator.js';

const router = Router();

router.use(authenticate, authorize('premios', 'crud'));

router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(actualizarPremioSchema),
  patchPremio
);
router.delete('/:id', validate(idParamSchema, 'params'), deletePremio);

export default router;
