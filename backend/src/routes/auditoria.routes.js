import { Router } from 'express';
import { getAuditoria } from '../controllers/reporte.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { listarAuditoriaQuerySchema } from '../validators/reporte.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('reportes', 'leer'),
  validate(listarAuditoriaQuerySchema, 'query'),
  getAuditoria
);

export default router;
