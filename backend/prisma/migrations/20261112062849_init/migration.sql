-- CreateTable
CREATE TABLE `usuario` (
    `usuarioId` INTEGER NOT NULL AUTO_INCREMENT,
    `alias` VARCHAR(40) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `nombres` VARCHAR(80) NOT NULL,
    `apellidos` VARCHAR(80) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuario_alias_key`(`alias`),
    UNIQUE INDEX `usuario_email_key`(`email`),
    UNIQUE INDEX `usuario_telefono_key`(`telefono`),
    PRIMARY KEY (`usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `refreshTokenId` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiraEn` DATETIME(3) NOT NULL,
    `revocado` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `refresh_token_tokenHash_key`(`tokenHash`),
    INDEX `refresh_token_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`refreshTokenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `rolId` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(200) NULL,

    UNIQUE INDEX `rol_nombre_key`(`nombre`),
    PRIMARY KEY (`rolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permiso` (
    `permisoId` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `recurso` VARCHAR(50) NOT NULL,
    `accion` VARCHAR(50) NOT NULL,
    `estaActivo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `permiso_recurso_accion_key`(`recurso`, `accion`),
    PRIMARY KEY (`permisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol_usuario` (
    `usuarioId` INTEGER NOT NULL,
    `rolId` INTEGER NOT NULL,

    PRIMARY KEY (`usuarioId`, `rolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permiso_rol` (
    `rolId` INTEGER NOT NULL,
    `permisoId` INTEGER NOT NULL,

    PRIMARY KEY (`rolId`, `permisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permiso_usuario` (
    `usuarioId` INTEGER NOT NULL,
    `permisoId` INTEGER NOT NULL,

    PRIMARY KEY (`usuarioId`, `permisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_permiso` (
    `historialPermisoId` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioAdminId` INTEGER NULL,
    `usuarioAfectadoId` INTEGER NULL,
    `rolAfectadoId` INTEGER NULL,
    `permisoId` INTEGER NULL,
    `operacion` VARCHAR(40) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`historialPermisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `causa_solidaria` (
    `causaId` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `meta` DECIMAL(12, 2) NULL,

    PRIMARY KEY (`causaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rifa_solicitada` (
    `rifaSolicitadaId` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `causaId` INTEGER NULL,
    `revisadoPorId` INTEGER NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `precioTicket` DECIMAL(10, 2) NOT NULL,
    `cantidadTickets` INTEGER NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `fechaSolicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('REVISION', 'ESPERANDO_PAGO', 'PAGO_CONFIRMADO', 'APROBADA', 'RECHAZADA') NOT NULL DEFAULT 'REVISION',
    `referenciaPago` VARCHAR(80) NULL,
    `observacion` TEXT NULL,
    `fechaResolucion` DATETIME(3) NULL,

    INDEX `rifa_solicitada_usuarioId_idx`(`usuarioId`),
    INDEX `rifa_solicitada_estado_idx`(`estado`),
    PRIMARY KEY (`rifaSolicitadaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rifa` (
    `rifaId` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioCreadorId` INTEGER NOT NULL,
    `rifaSolicitadaId` INTEGER NULL,
    `causaId` INTEGER NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `precioTicket` DECIMAL(10, 2) NOT NULL,
    `cantidadTickets` INTEGER NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `estado` ENUM('ACTIVA', 'EXTENDIDA', 'FINALIZADA') NOT NULL DEFAULT 'ACTIVA',

    UNIQUE INDEX `rifa_rifaSolicitadaId_key`(`rifaSolicitadaId`),
    PRIMARY KEY (`rifaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket` (
    `ticketId` INTEGER NOT NULL AUTO_INCREMENT,
    `rifaId` INTEGER NOT NULL,
    `usuarioId` INTEGER NULL,
    `pagoId` INTEGER NULL,
    `numeroTicket` INTEGER NOT NULL,
    `estado` ENUM('DISPONIBLE', 'RESERVADO', 'VENDIDO', 'ANULADO') NOT NULL DEFAULT 'DISPONIBLE',
    `reservadoHasta` DATETIME(3) NULL,

    INDEX `ticket_rifaId_estado_idx`(`rifaId`, `estado`),
    UNIQUE INDEX `ticket_rifaId_numeroTicket_key`(`rifaId`, `numeroTicket`),
    PRIMARY KEY (`ticketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `premio` (
    `premioId` INTEGER NOT NULL AUTO_INCREMENT,
    `rifaId` INTEGER NOT NULL,
    `ticketGanadorId` INTEGER NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NULL,
    `valor` DECIMAL(12, 2) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `reclamado` BOOLEAN NOT NULL DEFAULT false,
    `datosEntrega` TEXT NULL,

    UNIQUE INDEX `premio_ticketGanadorId_key`(`ticketGanadorId`),
    PRIMARY KEY (`premioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pago` (
    `pagoId` INTEGER NOT NULL AUTO_INCREMENT,
    `rifaId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `verificadoPorId` INTEGER NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `metodo` VARCHAR(40) NOT NULL,
    `referencia` VARCHAR(80) NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`pagoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sorteo` (
    `sorteoId` INTEGER NOT NULL AUTO_INCREMENT,
    `rifaId` INTEGER NOT NULL,
    `ticketGanadorId` INTEGER NOT NULL,
    `realizadoPorId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacion` TEXT NULL,

    UNIQUE INDEX `sorteo_rifaId_key`(`rifaId`),
    UNIQUE INDEX `sorteo_ticketGanadorId_key`(`ticketGanadorId`),
    PRIMARY KEY (`sorteoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_notificacion` (
    `tipoNotificacionId` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(60) NOT NULL,
    `plantillaTitulo` VARCHAR(150) NOT NULL,
    `plantillaMensaje` TEXT NOT NULL,
    `variables` JSON NULL,
    `estaActivo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tipo_notificacion_codigo_key`(`codigo`),
    PRIMARY KEY (`tipoNotificacionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacion` (
    `notificacionId` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoNotificacionId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`notificacionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacion_usuario` (
    `notificacionId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `eliminada` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`notificacionId`, `usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `auditoriaId` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `entidad` VARCHAR(40) NOT NULL,
    `entidadId` INTEGER NOT NULL,
    `accion` VARCHAR(60) NOT NULL,
    `detalle` JSON NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auditoria_entidad_entidadId_idx`(`entidad`, `entidadId`),
    PRIMARY KEY (`auditoriaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rol_usuario` ADD CONSTRAINT `rol_usuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rol_usuario` ADD CONSTRAINT `rol_usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `rol`(`rolId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permiso_rol` ADD CONSTRAINT `permiso_rol_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `rol`(`rolId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permiso_rol` ADD CONSTRAINT `permiso_rol_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `permiso`(`permisoId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permiso_usuario` ADD CONSTRAINT `permiso_usuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permiso_usuario` ADD CONSTRAINT `permiso_usuario_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `permiso`(`permisoId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_permiso` ADD CONSTRAINT `historial_permiso_usuarioAdminId_fkey` FOREIGN KEY (`usuarioAdminId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_permiso` ADD CONSTRAINT `historial_permiso_usuarioAfectadoId_fkey` FOREIGN KEY (`usuarioAfectadoId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_permiso` ADD CONSTRAINT `historial_permiso_rolAfectadoId_fkey` FOREIGN KEY (`rolAfectadoId`) REFERENCES `rol`(`rolId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_permiso` ADD CONSTRAINT `historial_permiso_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `permiso`(`permisoId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa_solicitada` ADD CONSTRAINT `rifa_solicitada_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa_solicitada` ADD CONSTRAINT `rifa_solicitada_revisadoPorId_fkey` FOREIGN KEY (`revisadoPorId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa_solicitada` ADD CONSTRAINT `rifa_solicitada_causaId_fkey` FOREIGN KEY (`causaId`) REFERENCES `causa_solidaria`(`causaId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa` ADD CONSTRAINT `rifa_usuarioCreadorId_fkey` FOREIGN KEY (`usuarioCreadorId`) REFERENCES `usuario`(`usuarioId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa` ADD CONSTRAINT `rifa_rifaSolicitadaId_fkey` FOREIGN KEY (`rifaSolicitadaId`) REFERENCES `rifa_solicitada`(`rifaSolicitadaId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rifa` ADD CONSTRAINT `rifa_causaId_fkey` FOREIGN KEY (`causaId`) REFERENCES `causa_solidaria`(`causaId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifa`(`rifaId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_pagoId_fkey` FOREIGN KEY (`pagoId`) REFERENCES `pago`(`pagoId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `premio` ADD CONSTRAINT `premio_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifa`(`rifaId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `premio` ADD CONSTRAINT `premio_ticketGanadorId_fkey` FOREIGN KEY (`ticketGanadorId`) REFERENCES `ticket`(`ticketId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifa`(`rifaId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_verificadoPorId_fkey` FOREIGN KEY (`verificadoPorId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sorteo` ADD CONSTRAINT `sorteo_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifa`(`rifaId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sorteo` ADD CONSTRAINT `sorteo_ticketGanadorId_fkey` FOREIGN KEY (`ticketGanadorId`) REFERENCES `ticket`(`ticketId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sorteo` ADD CONSTRAINT `sorteo_realizadoPorId_fkey` FOREIGN KEY (`realizadoPorId`) REFERENCES `usuario`(`usuarioId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_tipoNotificacionId_fkey` FOREIGN KEY (`tipoNotificacionId`) REFERENCES `tipo_notificacion`(`tipoNotificacionId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion_usuario` ADD CONSTRAINT `notificacion_usuario_notificacionId_fkey` FOREIGN KEY (`notificacionId`) REFERENCES `notificacion`(`notificacionId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacion_usuario` ADD CONSTRAINT `notificacion_usuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`usuarioId`) ON DELETE SET NULL ON UPDATE CASCADE;
