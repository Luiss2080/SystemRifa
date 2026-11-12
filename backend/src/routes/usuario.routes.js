import { Router } from 'express';
import { patchMiPassword, patchMiPerfil } from '../controllers/usuario.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  actualizarPerfilSchema,
  cambiarPasswordSchema
} from '../validators/usuario.validator.js';

const router = Router();

router.patch('/me', authenticate, validate(actualizarPerfilSchema), patchMiPerfil);
router.patch('/me/password', authenticate, validate(cambiarPasswordSchema), patchMiPassword);

export default router;

