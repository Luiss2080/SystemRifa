import { Router } from 'express';
import {
  deleteCausa,
  getCausaById,
  getCausas,
  patchCausa,
  postCausa
} from '../controllers/causa.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { actualizarCausaSchema, crearCausaSchema } from '../validators/causa.validator.js';

const router = Router();

router.get('/', getCausas);
router.get('/:id', validate(idParamSchema, 'params'), getCausaById);

router.post(
  '/',
  authenticate,
  authorize('causas', 'crud'),
  validate(crearCausaSchema),
  postCausa
);
router.patch(
  '/:id',
  authenticate,
  authorize('causas', 'crud'),
  validate(idParamSchema, 'params'),
  validate(actualizarCausaSchema),
  patchCausa
);
router.delete(
  '/:id',
  authenticate,
  authorize('causas', 'crud'),
  validate(idParamSchema, 'params'),
  deleteCausa
);

export default router;

