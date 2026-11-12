import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import rolRoutes from './rol.routes.js';
import permisoRoutes from './permiso.routes.js';
import historialPermisoRoutes from './historialPermiso.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);
router.use('/permisos', permisoRoutes);
router.use('/historial-permisos', historialPermisoRoutes);

export default router;
