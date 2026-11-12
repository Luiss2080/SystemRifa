-- CreateIndex
CREATE INDEX `pago_rifaId_estado_idx` ON `pago`(`rifaId`, `estado`);

-- CreateIndex
CREATE INDEX `pago_estado_rifaId_idx` ON `pago`(`estado`, `rifaId`);

-- CreateIndex
CREATE INDEX `rifa_estado_fechaFin_idx` ON `rifa`(`estado`, `fechaFin`);

-- CreateIndex
CREATE INDEX `ticket_estado_reservadoHasta_idx` ON `ticket`(`estado`, `reservadoHasta`);
