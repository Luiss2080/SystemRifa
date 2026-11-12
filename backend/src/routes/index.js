import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import rolRoutes from './rol.routes.js';
import permisoRoutes from './permiso.routes.js';
import historialPermisoRoutes from './historialPermiso.routes.js';
import notificacionRoutes from './notificacion.routes.js';
import tipoNotificacionRoutes from './tipoNotificacion.routes.js';
import causaRoutes from './causa.routes.js';
import solicitudRoutes from './solicitud.routes.js';
import rifaRoutes from './rifa.routes.js';
import premioRoutes from './premio.routes.js';
import ticketRoutes from './ticket.routes.js';
import pagoRoutes from './pago.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);
router.use('/permisos', permisoRoutes);
router.use('/historial-permisos', historialPermisoRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/tipos-notificacion', tipoNotificacionRoutes);
router.use('/causas', causaRoutes);
router.use('/solicitudes', solicitudRoutes);
router.use('/rifas', rifaRoutes);
router.use('/premios', premioRoutes);
router.use('/tickets', ticketRoutes);
router.use('/pagos', pagoRoutes);

export default router;
