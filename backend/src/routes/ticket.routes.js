import { Router } from 'express';
import { getMisTickets, postAnularTicket } from '../controllers/ticket.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/usuario.validator.js';
import { anularTicketSchema } from '../validators/rifa.validator.js';

const router = Router();

router.use(authenticate);

router.get('/mios', getMisTickets);
router.post(
  '/:id/anular',
  authorize('rifas', 'administrar'),
  validate(idParamSchema, 'params'),
  validate(anularTicketSchema),
  postAnularTicket
);

export default router;

