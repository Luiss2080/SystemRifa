-- =============================================================================
-- SISTEMA DE RIFAS SOLIDARIAS - UPDS
-- SCRIPT COMPLETO DE MIGRACIÓN Y SEEDERS (MySQL / Laragon)
-- =============================================================================
-- Compatible con: MySQL 8.0+, MariaDB 10.4+, Laragon, HeidiSQL, phpMyAdmin
-- Contiene: Creación de base de datos, tablas, índices, llaves foráneas y datos demo.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `system_rifa`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `system_rifa`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. DROP DE TABLAS PREVIAS (Para re-ejecución limpia)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notificacion_usuario`;
DROP TABLE IF EXISTS `notificacion`;
DROP TABLE IF EXISTS `tipo_notificacion`;
DROP TABLE IF EXISTS `auditoria`;
DROP TABLE IF EXISTS `sorteo`;
DROP TABLE IF EXISTS `pago`;
DROP TABLE IF EXISTS `premio`;
DROP TABLE IF EXISTS `ticket`;
DROP TABLE IF EXISTS `rifa`;
DROP TABLE IF EXISTS `rifa_solicitada`;
DROP TABLE IF EXISTS `causa_solidaria`;
DROP TABLE IF EXISTS `historial_permiso`;
DROP TABLE IF EXISTS `permiso_usuario`;
DROP TABLE IF EXISTS `permiso_rol`;
DROP TABLE IF EXISTS `rol_usuario`;
DROP TABLE IF EXISTS `permiso`;
DROP TABLE IF EXISTS `rol`;
DROP TABLE IF EXISTS `refresh_token`;
DROP TABLE IF EXISTS `usuario`;

-- -----------------------------------------------------------------------------
-- 2. ESTRUCTURA DE TABLAS (DDL)
-- -----------------------------------------------------------------------------

CREATE TABLE `usuario` (
  `usuarioId` INT NOT NULL AUTO_INCREMENT,
  `alias` VARCHAR(40) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `telefono` VARCHAR(20) NULL,
  `nombres` VARCHAR(80) NOT NULL,
  `apellidos` VARCHAR(80) NOT NULL,
  `passwordHash` VARCHAR(100) NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`usuarioId`),
  UNIQUE KEY `usuario_alias_key` (`alias`),
  UNIQUE KEY `usuario_email_key` (`email`),
  UNIQUE KEY `usuario_telefono_key` (`telefono`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refresh_token` (
  `refreshTokenId` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL,
  `expiraEn` DATETIME(3) NOT NULL,
  `revocado` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`refreshTokenId`),
  UNIQUE KEY `refresh_token_tokenHash_key` (`tokenHash`),
  KEY `refresh_token_usuarioId_idx` (`usuarioId`),
  CONSTRAINT `fk_refresh_token_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rol` (
  `rolId` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(200) NULL,
  PRIMARY KEY (`rolId`),
  UNIQUE KEY `rol_nombre_key` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permiso` (
  `permisoId` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `recurso` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(50) NOT NULL,
  `estaActivo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`permisoId`),
  UNIQUE KEY `permiso_recurso_accion_key` (`recurso`, `accion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rol_usuario` (
  `usuarioId` INT NOT NULL,
  `rolId` INT NOT NULL,
  PRIMARY KEY (`usuarioId`, `rolId`),
  KEY `fk_rol_usuario_rol` (`rolId`),
  CONSTRAINT `fk_rol_usuario_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`) ON DELETE CASCADE,
  CONSTRAINT `fk_rol_usuario_rol` FOREIGN KEY (`rolId`) REFERENCES `rol` (`rolId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permiso_rol` (
  `rolId` INT NOT NULL,
  `permisoId` INT NOT NULL,
  PRIMARY KEY (`rolId`, `permisoId`),
  KEY `fk_permiso_rol_permiso` (`permisoId`),
  CONSTRAINT `fk_permiso_rol_rol` FOREIGN KEY (`rolId`) REFERENCES `rol` (`rolId`) ON DELETE CASCADE,
  CONSTRAINT `fk_permiso_rol_permiso` FOREIGN KEY (`permisoId`) REFERENCES `permiso` (`permisoId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permiso_usuario` (
  `usuarioId` INT NOT NULL,
  `permisoId` INT NOT NULL,
  PRIMARY KEY (`usuarioId`, `permisoId`),
  KEY `fk_permiso_usuario_permiso` (`permisoId`),
  CONSTRAINT `fk_permiso_usuario_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`) ON DELETE CASCADE,
  CONSTRAINT `fk_permiso_usuario_permiso` FOREIGN KEY (`permisoId`) REFERENCES `permiso` (`permisoId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historial_permiso` (
  `historialPermisoId` INT NOT NULL AUTO_INCREMENT,
  `usuarioAdminId` INT NULL,
  `usuarioAfectadoId` INT NULL,
  `rolAfectadoId` INT NULL,
  `permisoId` INT NULL,
  `operacion` VARCHAR(40) NOT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`historialPermisoId`),
  KEY `fk_hist_admin` (`usuarioAdminId`),
  KEY `fk_hist_afectado` (`usuarioAfectadoId`),
  KEY `fk_hist_rol` (`rolAfectadoId`),
  KEY `fk_hist_permiso` (`permisoId`),
  CONSTRAINT `fk_hist_admin` FOREIGN KEY (`usuarioAdminId`) REFERENCES `usuario` (`usuarioId`) ON DELETE SET NULL,
  CONSTRAINT `fk_hist_afectado` FOREIGN KEY (`usuarioAfectadoId`) REFERENCES `usuario` (`usuarioId`) ON DELETE SET NULL,
  CONSTRAINT `fk_hist_rol` FOREIGN KEY (`rolAfectadoId`) REFERENCES `rol` (`rolId`) ON DELETE SET NULL,
  CONSTRAINT `fk_hist_permiso` FOREIGN KEY (`permisoId`) REFERENCES `permiso` (`permisoId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `causa_solidaria` (
  `causaId` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` TEXT NULL,
  `meta` DECIMAL(12, 2) NULL,
  PRIMARY KEY (`causaId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rifa_solicitada` (
  `rifaSolicitadaId` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NOT NULL,
  `causaId` INT NULL,
  `revisadoPorId` INT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` TEXT NULL,
  `precioTicket` DECIMAL(10, 2) NOT NULL,
  `cantidadTickets` INT NOT NULL,
  `fechaInicio` DATETIME(3) NOT NULL,
  `fechaFin` DATETIME(3) NOT NULL,
  `fechaSolicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `estado` ENUM('REVISION', 'ESPERANDO_PAGO', 'PAGO_CONFIRMADO', 'APROBADA', 'RECHAZADA') NOT NULL DEFAULT 'REVISION',
  `referenciaPago` VARCHAR(80) NULL,
  `observacion` TEXT NULL,
  `fechaResolucion` DATETIME(3) NULL,
  PRIMARY KEY (`rifaSolicitadaId`),
  KEY `rifa_solicitada_usuarioId_idx` (`usuarioId`),
  KEY `rifa_solicitada_estado_idx` (`estado`),
  CONSTRAINT `fk_solicitud_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`),
  CONSTRAINT `fk_solicitud_revisor` FOREIGN KEY (`revisadoPorId`) REFERENCES `usuario` (`usuarioId`),
  CONSTRAINT `fk_solicitud_causa` FOREIGN KEY (`causaId`) REFERENCES `causa_solidaria` (`causaId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rifa` (
  `rifaId` INT NOT NULL AUTO_INCREMENT,
  `usuarioCreadorId` INT NOT NULL,
  `rifaSolicitadaId` INT NULL,
  `causaId` INT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` TEXT NULL,
  `precioTicket` DECIMAL(10, 2) NOT NULL,
  `cantidadTickets` INT NOT NULL,
  `fechaInicio` DATETIME(3) NOT NULL,
  `fechaFin` DATETIME(3) NOT NULL,
  `estado` ENUM('ACTIVA', 'EXTENDIDA', 'FINALIZADA') NOT NULL DEFAULT 'ACTIVA',
  PRIMARY KEY (`rifaId`),
  UNIQUE KEY `rifa_rifaSolicitadaId_key` (`rifaSolicitadaId`),
  KEY `rifa_estado_fechaFin_idx` (`estado`, `fechaFin`),
  CONSTRAINT `fk_rifa_creador` FOREIGN KEY (`usuarioCreadorId`) REFERENCES `usuario` (`usuarioId`),
  CONSTRAINT `fk_rifa_solicitada` FOREIGN KEY (`rifaSolicitadaId`) REFERENCES `rifa_solicitada` (`rifaSolicitadaId`),
  CONSTRAINT `fk_rifa_causa` FOREIGN KEY (`causaId`) REFERENCES `causa_solidaria` (`causaId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pago` (
  `pagoId` INT NOT NULL AUTO_INCREMENT,
  `rifaId` INT NOT NULL,
  `usuarioId` INT NOT NULL,
  `verificadoPorId` INT NULL,
  `monto` DECIMAL(10, 2) NOT NULL,
  `metodo` VARCHAR(40) NOT NULL,
  `referencia` VARCHAR(80) NULL,
  `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`pagoId`),
  KEY `pago_rifaId_estado_idx` (`rifaId`, `estado`),
  KEY `pago_estado_rifaId_idx` (`estado`, `rifaId`),
  CONSTRAINT `fk_pago_rifa` FOREIGN KEY (`rifaId`) REFERENCES `rifa` (`rifaId`),
  CONSTRAINT `fk_pago_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`),
  CONSTRAINT `fk_pago_verificador` FOREIGN KEY (`verificadoPorId`) REFERENCES `usuario` (`usuarioId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ticket` (
  `ticketId` INT NOT NULL AUTO_INCREMENT,
  `rifaId` INT NOT NULL,
  `usuarioId` INT NULL,
  `pagoId` INT NULL,
  `numeroTicket` INT NOT NULL,
  `estado` ENUM('DISPONIBLE', 'RESERVADO', 'VENDIDO', 'ANULADO') NOT NULL DEFAULT 'DISPONIBLE',
  `reservadoHasta` DATETIME(3) NULL,
  PRIMARY KEY (`ticketId`),
  UNIQUE KEY `ticket_rifaId_numeroTicket_key` (`rifaId`, `numeroTicket`),
  KEY `ticket_rifaId_estado_idx` (`rifaId`, `estado`),
  KEY `ticket_estado_reservadoHasta_idx` (`estado`, `reservadoHasta`),
  CONSTRAINT `fk_ticket_rifa` FOREIGN KEY (`rifaId`) REFERENCES `rifa` (`rifaId`) ON DELETE CASCADE,
  CONSTRAINT `fk_ticket_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`),
  CONSTRAINT `fk_ticket_pago` FOREIGN KEY (`pagoId`) REFERENCES `pago` (`pagoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `premio` (
  `premioId` INT NOT NULL AUTO_INCREMENT,
  `rifaId` INT NOT NULL,
  `ticketGanadorId` INT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` TEXT NULL,
  `valor` DECIMAL(12, 2) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `reclamado` TINYINT(1) NOT NULL DEFAULT 0,
  `datosEntrega` TEXT NULL,
  PRIMARY KEY (`premioId`),
  UNIQUE KEY `premio_ticketGanadorId_key` (`ticketGanadorId`),
  CONSTRAINT `fk_premio_rifa` FOREIGN KEY (`rifaId`) REFERENCES `rifa` (`rifaId`) ON DELETE CASCADE,
  CONSTRAINT `fk_premio_ticket` FOREIGN KEY (`ticketGanadorId`) REFERENCES `ticket` (`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sorteo` (
  `sorteoId` INT NOT NULL AUTO_INCREMENT,
  `rifaId` INT NOT NULL,
  `ticketGanadorId` INT NOT NULL,
  `realizadoPorId` INT NOT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `observacion` TEXT NULL,
  PRIMARY KEY (`sorteoId`),
  UNIQUE KEY `sorteo_rifaId_key` (`rifaId`),
  UNIQUE KEY `sorteo_ticketGanadorId_key` (`ticketGanadorId`),
  CONSTRAINT `fk_sorteo_rifa` FOREIGN KEY (`rifaId`) REFERENCES `rifa` (`rifaId`),
  CONSTRAINT `fk_sorteo_ticket` FOREIGN KEY (`ticketGanadorId`) REFERENCES `ticket` (`ticketId`),
  CONSTRAINT `fk_sorteo_usuario` FOREIGN KEY (`realizadoPorId`) REFERENCES `usuario` (`usuarioId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tipo_notificacion` (
  `tipoNotificacionId` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(60) NOT NULL,
  `plantillaTitulo` VARCHAR(150) NOT NULL,
  `plantillaMensaje` TEXT NOT NULL,
  `variables` JSON NULL,
  `estaActivo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`tipoNotificacionId`),
  UNIQUE KEY `tipo_notificacion_codigo_key` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notificacion` (
  `notificacionId` INT NOT NULL AUTO_INCREMENT,
  `tipoNotificacionId` INT NOT NULL,
  `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`notificacionId`),
  CONSTRAINT `fk_notificacion_tipo` FOREIGN KEY (`tipoNotificacionId`) REFERENCES `tipo_notificacion` (`tipoNotificacionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notificacion_usuario` (
  `notificacionId` INT NOT NULL,
  `usuarioId` INT NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `eliminada` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`notificacionId`, `usuarioId`),
  CONSTRAINT `fk_notif_user_notif` FOREIGN KEY (`notificacionId`) REFERENCES `notificacion` (`notificacionId`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_user_user` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditoria` (
  `auditoriaId` INT NOT NULL AUTO_INCREMENT,
  `usuarioId` INT NULL,
  `entidad` VARCHAR(40) NOT NULL,
  `entidadId` INT NOT NULL,
  `accion` VARCHAR(60) NOT NULL,
  `detalle` JSON NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`auditoriaId`),
  KEY `auditoria_entidad_entidadId_idx` (`entidad`, `entidadId`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`usuarioId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. SEEDERS: ROLES DEL SISTEMA
-- -----------------------------------------------------------------------------
INSERT INTO `rol` (`rolId`, `nombre`, `descripcion`) VALUES
(1, 'ADMINISTRADOR', 'Acceso total a la administración, verificación de pagos, solicitudes, usuarios y reportes'),
(2, 'ORGANIZADOR', 'Gestión de sus propias rifas aprobadas, premios, sorteos y reportes'),
(3, 'PARTICIPANTE', 'Usuario participante que puede comprar tickets, registrar pagos y solicitar rifas');

-- -----------------------------------------------------------------------------
-- 4. SEEDERS: CATÁLOGO DE PERMISOS (18 PERMISOS)
-- -----------------------------------------------------------------------------
INSERT INTO `permiso` (`permisoId`, `recurso`, `accion`, `nombre`, `estaActivo`) VALUES
(1, 'usuarios', 'leer', 'Listar y ver usuarios', 1),
(2, 'usuarios', 'administrar', 'Activar o desactivar cuentas', 1),
(3, 'roles', 'administrar', 'CRUD de roles y asignarlos', 1),
(4, 'permisos', 'administrar', 'CRUD de permisos y asignarlos', 1),
(5, 'causas', 'crud', 'Gestionar causas solidarias', 1),
(6, 'solicitudes', 'crear', 'Enviar solicitud de rifa', 1),
(7, 'solicitudes', 'revisar', 'Revisar, cambiar estado, aprobar', 1),
(8, 'rifas', 'leer', 'Ver mis rifas y detalle interno', 1),
(9, 'rifas', 'administrar', 'Extender, finalizar, anular tickets', 1),
(10, 'premios', 'crud', 'Crear, editar, desactivar premios', 1),
(11, 'tickets', 'comprar', 'Reservar y liberar tickets', 1),
(12, 'pagos', 'registrar', 'Registrar pagos propios', 1),
(13, 'pagos', 'verificar', 'Confirmar o rechazar pagos', 1),
(14, 'sorteos', 'realizar', 'Realizar sorteo', 1),
(15, 'ganadores', 'publicar', 'Registrar entrega de premios', 1),
(16, 'reportes', 'leer', 'Reportes y auditoría', 1),
(17, 'notificaciones', 'leer', 'Ver y gestionar las propias', 1),
(18, 'plantillas', 'administrar', 'Editar plantillas de notificación', 1);

-- -----------------------------------------------------------------------------
-- 5. SEEDERS: MATRIZ DE PERMISOS POR ROL
-- -----------------------------------------------------------------------------
-- Administrador: todos los 18 permisos
INSERT INTO `permiso_rol` (`rolId`, `permisoId`)
SELECT 1, `permisoId` FROM `permiso`;

-- Organizador: rifas, premios, sorteos, ganadores, reportes
INSERT INTO `permiso_rol` (`rolId`, `permisoId`) VALUES
(2, 9),  -- rifas:administrar
(2, 10), -- premios:crud
(2, 14), -- sorteos:realizar
(2, 15), -- ganadores:publicar
(2, 16); -- reportes:leer

-- Participante: solicitudes crear, rifas leer, tickets comprar, pagos registrar, notificaciones leer
INSERT INTO `permiso_rol` (`rolId`, `permisoId`) VALUES
(3, 6),  -- solicitudes:crear
(3, 8),  -- rifas:leer
(3, 11), -- tickets:comprar
(3, 12), -- pagos:registrar
(3, 17); -- notificaciones:leer

-- -----------------------------------------------------------------------------
-- 6. SEEDERS: TIPOS DE NOTIFICACIÓN (CON {nombre} Y {alias})
-- -----------------------------------------------------------------------------
INSERT INTO `tipo_notificacion` (`tipoNotificacionId`, `codigo`, `plantillaTitulo`, `plantillaMensaje`, `variables`, `estaActivo`) VALUES
(1, 'BIENVENIDA', '¡Bienvenido/a a Rifas Solidarias, {nombre} (@{alias})!', 'Hola {nombre} (@{alias}), tu cuenta fue creada correctamente. Ya puedes explorar rifas solidarias y participar.', '["nombre", "alias"]', 1),
(2, 'NUEVA_SOLICITUD', 'Nueva solicitud de rifa: {nombreRifa}', 'El organizador {nombre} (@{alias}) ha enviado una nueva solicitud para la rifa «{nombreRifa}».', '["nombre", "alias", "nombreRifa"]', 1),
(3, 'SOLICITUD_RECIBIDA', 'Recibimos tu solicitud: {nombreRifa}', 'Tu solicitud para la rifa «{nombreRifa}» fue recibida y se encuentra en revisión.', '["nombreRifa"]', 1),
(4, 'SOLICITUD_ACTUALIZADA', 'Actualización de tu solicitud: {nombreRifa}', 'Tu solicitud para la rifa «{nombreRifa}» pasó al estado {estado}.', '["nombreRifa", "estado"]', 1),
(5, 'SOLICITUD_APROBADA', '¡Solicitud aprobada: {nombreRifa}!', 'Tu solicitud «{nombreRifa}» fue aprobada. La rifa ya fue creada; agrega al menos un premio activo para publicarla en el catálogo.', '["nombreRifa"]', 1),
(6, 'SOLICITUD_RECHAZADA', 'Solicitud rechazada: {nombreRifa}', 'Tu solicitud para la rifa «{nombreRifa}» fue rechazada. Observación: {observacion}', '["nombreRifa", "observacion"]', 1),
(7, 'TICKET_RESERVADO', 'Tickets reservados en {nombreRifa}', 'Reservaste los números {numeros} en «{nombreRifa}». Tienes {minutos} minutos para registrar tu pago.', '["nombreRifa", "numeros", "minutos"]', 1),
(8, 'RESERVA_VENCIDA', 'Reserva vencida en {nombreRifa}', 'Tu reserva de los números {numeros} en «{nombreRifa}» venció por falta de pago y los tickets volvieron a estar disponibles.', '["nombreRifa", "numeros"]', 1),
(9, 'NUEVO_PAGO', 'Nuevo pago pendiente en {nombreRifa}', 'El usuario {nombre} (@{alias}) registró un pago de Bs {monto} para la rifa «{nombreRifa}» pendiente de verificación.', '["nombre", "alias", "monto", "nombreRifa"]', 1),
(10, 'PAGO_CONFIRMADO', 'Pago confirmado en {nombreRifa}', 'Se confirmó tu pago de Bs {monto} en «{nombreRifa}». Tus tickets {numeros} ya están vendidos y participan del sorteo.', '["nombreRifa", "numeros", "monto"]', 1),
(11, 'PAGO_RECHAZADO', 'Pago rechazado en {nombreRifa}', 'Tu pago en «{nombreRifa}» fue rechazado. Motivo: {motivo}. Los tickets volvieron a estar disponibles.', '["nombreRifa", "motivo"]', 1),
(12, 'SORTEO_REALIZADO', 'Sorteo realizado: {nombreRifa}', 'El sorteo de la rifa «{nombreRifa}» ha finalizado. Número ganador principal: #{numeroGanador}.', '["nombreRifa", "numeroGanador"]', 1),
(13, 'GANADOR', '¡Felicidades! Ganaste en {nombreRifa}', 'Tu ticket #{numeroGanador} resultó ganador del premio «{premio}» en la rifa «{nombreRifa}».', '["nombreRifa", "numeroGanador", "premio"]', 1);

-- -----------------------------------------------------------------------------
-- 7. SEEDERS: CAUSAS SOLIDARIAS VERIFICADAS
-- -----------------------------------------------------------------------------
INSERT INTO `causa_solidaria` (`causaId`, `nombre`, `descripcion`, `meta`) VALUES
(1, 'Albergue Patitas Felices', 'Recaudación para alimento, vacunas y refugio de animales rescatados en situación de calle.', 5000.00),
(2, 'Comedor Infantil Esperanza', 'Apoyo nutricional y útiles escolares para niños en situación vulnerable de zonas periurbanas.', 8000.00),
(3, 'Salud Comunitaria Santa Cruz', 'Equipamiento de brigadas médicas móviles, toma de signos y medicamentos esenciales para barrios periurbanos.', 15000.00),
(4, 'Becas Tech y Robótica Juvenil', 'Kits de robótica educativa, licencias y becas tecnológicas para estudiantes de colegios públicos.', 12500.00),
(5, 'Hogar Abuelos del Oriente', 'Mejora de habitaciones, alimentación especializada y fisioterapia para adultos mayores sin recursos.', 6000.00),
(6, 'Reforestación Chiquitania Verde', 'Vivero comunitario y siembra de 3,000 plantines nativos en zonas afectadas por chaqueos.', 10000.00);

-- -----------------------------------------------------------------------------
-- 8. SEEDERS: USUARIOS DEMO (Contraseña común: Demo1234!)
-- Hash bcrypt cost 10 para Demo1234!: $2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.
-- -----------------------------------------------------------------------------
INSERT INTO `usuario` (`usuarioId`, `alias`, `email`, `telefono`, `nombres`, `apellidos`, `passwordHash`, `activo`, `creadoEn`) VALUES
(1, 'admin', 'admin@rifas.local', '70000001', 'Administrador', 'Sistema', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(2, 'AnaSolidaria', 'participante1@rifas.local', '70100002', 'Ana María', 'Rojas Soliz', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(3, 'OrgSolidario', 'organizador@rifas.local', '70100001', 'Carlos', 'Mendoza Vargas', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(4, 'LuisSolidario', 'participante2@rifas.local', '70100003', 'Luis Fernando', 'Pérez Moreno', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(5, 'DiegoV', 'participante4@rifas.local', '70100006', 'Diego Alejandro', 'Vargas Gutiérrez', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(6, 'LuciaCausa', 'organizador2@rifas.local', '70100004', 'Lucía Elena', 'Salvatierra Paz', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW()),
(7, 'MariaSolidaria', 'participante3@rifas.local', '70100005', 'María René', 'Fernández Castro', '$2b$10$WK5LrTZ/xRI5Rb6SNpU.XuPy3NoomjcV4Pg4TLovyOzAEnGZM0BU.', 1, NOW());

-- Asignación de Roles a Usuarios
INSERT INTO `rol_usuario` (`usuarioId`, `rolId`) VALUES
(1, 1), -- Admin -> ADMINISTRADOR
(2, 3), -- Ana -> PARTICIPANTE
(3, 2), -- Carlos -> ORGANIZADOR
(3, 3), -- Carlos -> PARTICIPANTE
(4, 3), -- Luis -> PARTICIPANTE
(5, 3), -- Diego -> PARTICIPANTE
(6, 2), -- Lucía -> ORGANIZADOR
(6, 3), -- Lucía -> PARTICIPANTE
(7, 3); -- María -> PARTICIPANTE

-- -----------------------------------------------------------------------------
-- 9. SEEDERS: RIFAS DEMO Y PREMIOS
-- -----------------------------------------------------------------------------
INSERT INTO `rifa` (`rifaId`, `usuarioCreadorId`, `causaId`, `nombre`, `descripcion`, `precioTicket`, `cantidadTickets`, `fechaInicio`, `fechaFin`, `estado`) VALUES
(1, 3, 1, 'Gran Rifa Pro Refugio Animal', 'Campaña solidaria para abastecer de alimento balanceado y medicinas veterinarias al albergue.', 25.00, 100, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'ACTIVA'),
(2, 6, 2, 'Rifa Escolar Semillas del Saber', 'Recaudación de mochilas y material didáctico para niños del comedor comunitario.', 15.00, 100, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'ACTIVA'),
(3, 3, 4, 'Rifa Solidaria Kits Robótica UPDS', 'Kits de arduino, sensores y laptops para estudiantes destacados de escasos recursos.', 20.00, 100, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'FINALIZADA');

-- Premios de las rifas
INSERT INTO `premio` (`premioId`, `rifaId`, `nombre`, `descripcion`, `valor`, `activo`, `reclamado`) VALUES
(1, 1, 'Bicicleta de Montaña Specialized', 'Marco de aluminio, 21 velocidades Shimano y casco de seguridad incluido.', 2500.00, 1, 0),
(2, 1, 'Smart TV Samsung 50" Crystal UHD', 'Pantalla 4K Smart TV con soporte de pared incluido.', 3200.00, 1, 0),
(3, 2, 'Tablet Lenovo Tab M10 FHD', 'Tablet para estudio de 10 pulgadas con funda protectora.', 1200.00, 1, 0),
(4, 3, 'Laptop Lenovo ThinkPad Ryzen 5', 'Procesador Ryzen 5, 16GB RAM y 512GB SSD NVMe.', 4500.00, 1, 1);

-- -----------------------------------------------------------------------------
-- 10. GENERACIÓN DE TICKETS Y PAGOS DEMO
-- -----------------------------------------------------------------------------

-- Tickets para Rifa #1 (100 números)
INSERT INTO `ticket` (`rifaId`, `numeroTicket`, `estado`)
SELECT 1, n, 'DISPONIBLE' FROM (
  WITH RECURSIVE nums AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 100
  ) SELECT n FROM nums
) seq;

-- Tickets para Rifa #2 (100 números)
INSERT INTO `ticket` (`rifaId`, `numeroTicket`, `estado`)
SELECT 2, n, 'DISPONIBLE' FROM (
  WITH RECURSIVE nums AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 100
  ) SELECT n FROM nums
) seq;

-- Tickets para Rifa #3 (100 números)
INSERT INTO `ticket` (`rifaId`, `numeroTicket`, `estado`)
SELECT 3, n, 'DISPONIBLE' FROM (
  WITH RECURSIVE nums AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 100
  ) SELECT n FROM nums
) seq;

-- Pagos Confirmados en Rifa #1
INSERT INTO `pago` (`pagoId`, `rifaId`, `usuarioId`, `verificadoPorId`, `monto`, `metodo`, `referencia`, `estado`, `fecha`) VALUES
(1, 1, 2, 1, 75.00, 'TRANSFERENCIA_QR', 'QR-BMSC-849201', 'CONFIRMADO', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 4, 1, 50.00, 'TRANSFERENCIA_BANCARIA', 'TRF-UNION-491028', 'CONFIRMADO', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 7, NULL, 50.00, 'TRANSFERENCIA_QR', 'QR-BNB-920184', 'PENDIENTE', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- Actualización de tickets vendidos para Rifa #1
UPDATE `ticket` SET `estado` = 'VENDIDO', `usuarioId` = 2, `pagoId` = 1 WHERE `rifaId` = 1 AND `numeroTicket` IN (7, 15, 77);
UPDATE `ticket` SET `estado` = 'VENDIDO', `usuarioId` = 4, `pagoId` = 2 WHERE `rifaId` = 1 AND `numeroTicket` IN (12, 45);
UPDATE `ticket` SET `estado` = 'RESERVADO', `usuarioId` = 7, `pagoId` = 3, `reservadoHasta` = DATE_ADD(NOW(), INTERVAL 12 MINUTE) WHERE `rifaId` = 1 AND `numeroTicket` IN (9, 21);

-- Sorteo realizado en Rifa #3 (Finalizada)
UPDATE `ticket` SET `estado` = 'VENDIDO', `usuarioId` = 2 WHERE `rifaId` = 3 AND `numeroTicket` = 77;
INSERT INTO `sorteo` (`sorteoId`, `rifaId`, `ticketGanadorId`, `realizadoPorId`, `fecha`, `observacion`)
SELECT 1, 3, `ticketId`, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Sorteo auditado con bolillero digital oficial UPDS.'
FROM `ticket` WHERE `rifaId` = 3 AND `numeroTicket` = 77;

UPDATE `premio` SET `ticketGanadorId` = (SELECT `ticketId` FROM `ticket` WHERE `rifaId` = 3 AND `numeroTicket` = 77 LIMIT 1), `datosEntrega` = 'Entregado en Rectorado UPDS el 16/11/2026' WHERE `premioId` = 4;

-- -----------------------------------------------------------------------------
-- 11. REACTIVACIÓN DE RESTRICCIONES FORÁNEAS
-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- FINALIZACIÓN EXITOSA
-- Base de datos inicializada con esquema relacional, triggers/índices, roles,
-- permisos, plantillas amigables ({nombre}), causas y transacciones demo.
-- =============================================================================
