# Checklist de Trazabilidad y Verificación Final

Trazabilidad oficial con los requisitos funcionales (`RF-01`..`RF-15`), no funcionales (`RNF-01`..`RNF-10`), tarjetas de Trello y recorrido completo (Secciones 15 y 16 de la guía).

## Requisitos Funcionales (RF)

| Código | Pasos | Cómo se verifica en el proyecto | Estado |
|---|---|---|---|
| **RF-01** | 3, 11 | Registro y perfil de usuario (`auth.test.js`, `RegistroPage.jsx`, `PerfilPage.jsx`) | Verificado |
| **RF-02** | 3, 11 | Login, rotación de refresh token y logout (`auth.test.js`, `client.js`, `LoginPage.jsx`) | Verificado |
| **RF-03** | 4, 13 | Permisos, roles e historial inmutable en `historial_permiso` (`permisos.test.js`, `AdminRolesPage.jsx`) | Verificado |
| **RF-04** | 7, 13 | CRUD de premios con desactivación y bloqueo tras finalización (`tickets.test.js`, `OrganizadorRifaGestionPage.jsx`) | Verificado |
| **RF-05** | 6, 13 | Flujo de solicitud de rifa y máquina de estados (`solicitudes.test.js`, `AdminSolicitudesPage.jsx`) | Verificado |
| **RF-06** | 6, 7 | Aprobación crea la rifa; se publica en catálogo al tener premio activo (`solicitudes.test.js`, `tickets.test.js`) | Verificado |
| **RF-07** | 6, 7 | Causa solidaria en solicitud/rifa y premios asociados (`causa.service.js`, `OrganizadorRifaGestionPage.jsx`) | Verificado |
| **RF-08** | 7, 12 | Catálogo y detalle públicos con condiciones y estado (`CatalogoPage.jsx`, `RifaDetallePage.jsx`) | Verificado |
| **RF-09** | 6, 7 | Tickets `1..N` generados al aprobar con índice `UNIQUE(rifaId, numeroTicket)` (`schema.prisma`, `solicitudes.test.js`) | Verificado |
| **RF-10** | 7 | Prueba obligatoria de concurrencia con 20 reservas simultáneas: 1 éxito y 19 `409` (`tickets.test.js`) | Verificado |
| **RF-11** | 8 | Pago pendiente, verificación administrativa y bloqueo de doble confirmación (`pagos.test.js`, `AdminPagosPage.jsx`) | Verificado |
| **RF-12** | 9 | Sorteo criptográfico exclusivo entre tickets `VENDIDO` sin repetición (`sorteo.test.js`, `sorteo.service.js`) | Verificado |
| **RF-13** | 9, 12 | Resultado público sin PII y registro de entrega de premios (`sorteo.test.js`, `ResultadoPublicoPage.jsx`) | Verificado |
| **RF-14** | 10, 13 | Reportes de tickets, recaudación confirmada y consolidado por causa (`reportes.test.js`, `AdminReportesPage.jsx`) | Verificado |
| **RF-15** | 5, 12 | Notificaciones por evento con variables validadas y centro de notificaciones (`notificaciones.test.js`, `NotificacionesPage.jsx`) | Verificado |

## Requisitos No Funcionales (RNF)

| Código | Pasos | Criterio y evidencia | Estado |
|---|---|---|---|
| **RNF-01** | 3, 4, 14 | Todos los endpoints protegidos con `authenticate` + `authorize` + `rateLimit` (`login`, `reservas`, `pagos`) | Verificado |
| **RNF-02** | 1, 14, 15 | Sin secretos en repositorio, imágenes ni logs (`logger.js` redacta tokens/contraseñas; `.env` ignorado) | Verificado |
| **RNF-03** | 7 | Transacciones ACID y prueba de concurrencia (`withTransaction`, `tickets.test.js`) | Verificado |
| **RNF-04** | 11 a 13 | Validaciones Zod en backend y mensajes claros mapeados en español en formularios (`apiError.js`) | Verificado |
| **RNF-05** | 11 a 13 | Diseño responsive móvil y escritorio en layouts, tablas y cuadrícula de tickets (`Tailwind CSS`) | Verificado |
| **RNF-06** | 10, 14 | Reportes con 10.000 tickets por debajo de 3 s (`14.0ms`, `6.2ms`, `8.3ms` medidos en `reportes.test.js` + índices `EXPLAIN`) | Verificado |
| **RNF-07** | 1 | Arquitectura estricta en capas `routes → controllers → services → repositories` | Verificado |
| **RNF-08** | 4, 6, 8, 9, 10 | Trazabilidad inmutable en `auditoria` e `historial_permiso` (`AdminAuditoriaPage.jsx`) | Verificado |
| **RNF-09** | 15 | Respaldo con `mysqldump` (`scripts/backup-mysql.ps1`, `.sh`) y restauración probada en base limpia | Verificado |
| **RNF-10** | 14 | Suite automatizada de integración, concurrencia, autorización, sorteo y flujo E2E (`45/45` tests) | Verificado |

## Trazabilidad con Tablero Trello

| Tarjeta | Pasos | Alcance implementado |
|---|---|---|
| `SP1-02, SP1-07, SP1-08` | 2 | Modelo Prisma `schema.prisma`, migraciones MySQL 8 y seed idempotente |
| `PB-01` | 3, 11 | Registro, login, rotación de refresh tokens y logout |
| `PB-02` | 3, 11 | Perfil de usuario y cambio de contraseña |
| `PB-03` | 6, 13 | Solicitud, revisión de tarifa, ajuste y aprobación |
| `PB-04` | 6, 7 | Administración, extensión y publicación condicionada a premios activos |
| `PB-05` | 7, 8, 12 | Reserva atómica de tickets, expiración automática, pagos y verificación |
| `PB-06` | 7, 9 | Premios, sorteo criptográfico, resultado sin PII y entrega |
| `PB-07` | 4 | Roles, permisos efectivos, caché e historial de permisos |
| `PB-08` | 5 | Notificaciones post-commit y plantillas editables |
| `PB-09` | 10, 13 | Reportes globales, por causa, por rifa y auditoría |
| `PB-10` | 1, 14, 15 | Pruebas E2E/cobertura, seguridad, Dockerfiles multi-stage y respaldos |

## Recorrido Completo de 15 Puntos (Sección 15)

Cubierto automáticamente de punta a punta en `backend/tests/e2e.test.js` y en las pruebas modulares (`auth`, `permisos`, `notificaciones`, `solicitudes`, `tickets`, `pagos`, `sorteo`, `reportes`), además de estar habilitado en el frontend para ejecución manual con `npm run seed:demo`:

1. Registro + notificación `BIENVENIDA` (`auth.test.js`, `notificaciones.test.js`, `RegistroPage.jsx`)
2. Envío de solicitud + `NUEVA_SOLICITUD` a administradores (`solicitudes.test.js`, `NuevaSolicitudPage.jsx`)
3. Cambio a `PAGO_CONFIRMADO` y aprobación creando rifa y tickets (`e2e.test.js`, `AdminSolicitudesPage.jsx`)
4. Rol `ORGANIZADOR` otorgado y rifa visible en «Mis rifas» (`solicitudes.test.js`, `OrganizadorRifasPage.jsx`)
5. Carga del primer premio habilita visibilidad en catálogo (`tickets.test.js`, `OrganizadorRifaGestionPage.jsx`)
6. Reserva de números, cuenta regresiva y control de concurrencia 20x (`tickets.test.js`, `RifaDetallePage.jsx`)
7. Registro de pago + `NUEVO_PAGO` + confirmación pasando tickets a `VENDIDO` (`pagos.test.js`, `AdminPagosPage.jsx`)
8. Expiración automática de reserva sin pago tras 15 min devolviendo ticket a `DISPONIBLE` (`tickets.test.js`, `liberarReservas.js`)
9. Extensión de fecha quedando `EXTENDIDA` y auditada (`tickets.test.js`, `OrganizadorRifaGestionPage.jsx`)
10. Sorteo solo sobre `VENDIDO` dejando rifa `FINALIZADA` (`sorteo.test.js`, `e2e.test.js`)
11. Notificación `GANADOR` y resultado público sin email ni teléfono (`sorteo.test.js`, `ResultadoPublicoPage.jsx`)
12. Registro de entrega de premio (`sorteo.test.js`, `e2e.test.js`)
13. Reportes filtrando únicamente recaudación con pagos `CONFIRMADO` (`reportes.test.js`, `AdminReportesPage.jsx`)
14. Respuesta `403` a participante en rutas/endpoints administrativos (`permisos.test.js`, `RequirePermiso.jsx`)
15. Auditoría registrando aprobación, pago, extensión y sorteo con responsable y fecha (`reportes.test.js`, `AdminAuditoriaPage.jsx`)
