import { Router } from 'express';
import {
  getCatalogoPublico,
  getMisRifas,
  getRifaById,
  patchExtenderRifa
} from '../controllers/rifa.controller.js';
import { getPremiosRifa, postPremioRifa } from '../controllers/premio.controller.js';
import {
  deleteLiberarReservas,
  getTicketsRifa,
  postReservarTickets
} from '../controllers/ticket.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize, exigirPropietarioORAdmin } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import {
  crearPremioSchema,
  extenderRifaSchema,
  liberarReservasSchema,
  listarMisRifasQuerySchema,
  listarRifasPublicasQuerySchema,
  reservarTicketsSchema
} from '../validators/rifa.validator.js';

const router = Router();

// Rutas estáticas antes de /:id
router.get(
  '/mias',
  authenticate,
  authorize('rifas', 'leer'),
  validate(listarMisRifasQuerySchema, 'query'),
  getMisRifas
);

// Catálogo y detalle públicos
router.get('/', validate(listarRifasPublicasQuerySchema, 'query'), getCatalogoPublico);
router.get('/:id', validate(idParamSchema, 'params'), getRifaById);
router.get('/:id/tickets', validate(idParamSchema, 'params'), getTicketsRifa);
router.get('/:id/premios', validate(idParamSchema, 'params'), getPremiosRifa);

// Gestión de rifa y premios (admin o creador)
router.patch(
  '/:id/extender',
  authenticate,
  authorize('rifas', 'administrar'),
  validate(idParamSchema, 'params'),
  exigirPropietarioORAdmin('id'),
  validate(extenderRifaSchema),
  patchExtenderRifa
);

router.post(
  '/:id/premios',
  authenticate,
  authorize('premios', 'crud'),
  validate(idParamSchema, 'params'),
  exigirPropietarioORAdmin('id'),
  validate(crearPremioSchema),
  postPremioRifa
);

// Reservas de tickets
router.post(
  '/:id/reservas',
  authenticate,
  authorize('tickets', 'comprar'),
  validate(idParamSchema, 'params'),
  validate(reservarTicketsSchema),
  postReservarTickets
);

router.delete(
  '/:id/reservas',
  authenticate,
  authorize('tickets', 'comprar'),
  validate(idParamSchema, 'params'),
  validate(liberarReservasSchema),
  deleteLiberarReservas
);

export default router;
