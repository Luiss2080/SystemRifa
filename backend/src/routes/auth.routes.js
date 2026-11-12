import { Router } from 'express';
import {
  getMe,
  postLogin,
  postLogout,
  postRefresh,
  postRegistro
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginRateLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registroSchema
} from '../validators/auth.validator.js';

const router = Router();

router.post('/registro', validate(registroSchema), postRegistro);
router.post('/login', loginRateLimiter, validate(loginSchema), postLogin);
router.post('/refresh', validate(refreshSchema), postRefresh);
router.post('/logout', authenticate, validate(logoutSchema), postLogout);
router.get('/me', authenticate, getMe);

export default router;
