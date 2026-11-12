# Checklist de Requisitos Funcionales y No Funcionales

## Requisitos Funcionales (RF)

| Código | Requisito | Implementación Principal | Estado |
|---|---|---|---|
| **RF-01** | Registro, login, refresh rotation y logout | `auth.service.js`, `tokens.js`, `LoginPage.jsx`, `RegistroPage.jsx` | Cubierto |
| **RF-02** | Perfil de usuario y cambio de contraseña | `usuario.service.js`, `PerfilPage.jsx` | Cubierto |
| **RF-03** | RBAC granular por roles, permisos y caché | `authorize.js`, `permissionCache.js`, `permiso.service.js`, `AdminRolesPage.jsx` | Cubierto |
| **RF-04** | Gestión de usuarios y protección último admin | `usuario.service.js`, `AdminUsuariosPage.jsx` | Cubierto |
| **RF-05** | Causas solidarias con restricción de eliminación | `causa.service.js`, `CausasPublicPage.jsx`, `AdminCausasPage.jsx` | Cubierto |
| **RF-06** | Solicitudes de rifa y máquina de estados | `solicitud.estados.js`, `solicitud.service.js`, `NuevaSolicitudPage.jsx`, `AdminSolicitudesPage.jsx` | Cubierto |
| **RF-07** | Generación transaccional de rifa y tickets `1..N` | `solicitud.service.js` (`aprobarSolicitud`), `rifa.repository.js` | Cubierto |
| **RF-08** | Premios activos por rifa y bloqueo tras sorteo | `premio.service.js`, `OrganizadorRifaGestionPage.jsx` | Cubierto |
| **RF-09** | Catálogo público, tablero y reserva atómica anti-doble-venta | `ticket.service.js`, `ticket.repository.js`, `CatalogoPage.jsx`, `RifaDetallePage.jsx` | Cubierto |
| **RF-10** | Liberación automática por expiración de reservas | `jobs/liberarReservas.js`, `ticket.repository.js` | Cubierto |
| **RF-11** | Registro y verificación de pagos (Confirmar / Rechazar) | `pago.service.js`, `pago.estados.js`, `MisPagosPage.jsx`, `AdminPagosPage.jsx` | Cubierto |
| **RF-12** | Sorteo criptográfico único entre tickets `VENDIDO` | `sorteo.service.js` (`crypto.randomInt`), `OrganizadorRifaGestionPage.jsx` | Cubierto |
| **RF-13** | Resultado público sin PII y entrega de premios | `sorteo.service.js` (`obtenerResultadoPublico`, `registrarEntregaPremio`), `ResultadoPublicoPage.jsx` | Cubierto |
| **RF-14** | Notificaciones internas con plantillas validadas | `notificacion.service.js`, `NotificacionesPage.jsx`, `AdminPlantillasPage.jsx` | Cubierto |
| **RF-15** | Reportes globales, por causa, por rifa y auditoría | `reporte.service.js`, `auditoria.service.js`, `AdminReportesPage.jsx`, `AdminAuditoriaPage.jsx` | Cubierto |

## Requisitos No Funcionales (RNF)

| Código | Criterio | Implementación / Verificación | Estado |
|---|---|---|---|
| **RNF-01** | Seguridad (JWT, bcrypt cost 12, Helmet, CORS, Rate Limit) | `tokens.js`, `auth.service.js`, `app.js`, `rateLimit.js` | Cubierto |
| **RNF-02** | Integridad transaccional ACID e invariantes | `withTransaction`, `updateMany` condicional, unique `[rifaId, numeroTicket]` | Cubierto |
| **RNF-03** | Concurrencia 20 reservas simultáneas (1 éxito, 19 `409`) | `tests/tickets.test.js` | Cubierto |
| **RNF-04** | Trazabilidad inmutable en `auditoria` y `historial_permiso` | `auditoria.service.js`, `permiso.service.js` | Cubierto |
| **RNF-05** | Precisión monetaria sin flotantes | `utils/money.js` (backend) y `utils/format.js` (frontend en centavos) | Cubierto |
| **RNF-06** | Rendimiento de reportes con 10.000 tickets (< 3s) | `tests/reportes.test.js` + índices Prisma/MySQL | Cubierto |
| **RNF-07** | Usabilidad móvil y manejo de conflictos sin perder selección | Tailwind responsive, `RifaDetallePage.jsx` | Cubierto |
| **RNF-08** | Tolerancia a fallos en notificaciones (post-commit) | Regla 9 en `notificacion.service.js` y `tests/notificaciones.test.js` | Cubierto |
| **RNF-09** | Portabilidad, Docker multi-stage no-root y respaldo MySQL | `Dockerfile`, `docker-compose.prod.yml`, `scripts/backup-mysql.*` | Cubierto |
| **RNF-10** | Mantenibilidad y documentación OpenAPI dev | `routes → controllers → services → repositories`, `openapi.js` (`/api/docs`) | Cubierto |
