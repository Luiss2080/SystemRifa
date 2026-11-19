# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-11-19

### Agregado

- Registro e inicio de sesión con JWT de acceso y refresh token rotativo.
- Roles (administrador, organizador, participante), permisos e historial inmutable de cambios de permisos.
- Solicitud de rifas con máquina de estados y aprobación administrativa.
- Tickets numerados con restricción única por rifa y reserva con liberación automática.
- Pagos pendientes con verificación administrativa y bloqueo de doble confirmación.
- Sorteo criptográfico entre tickets vendidos, con resultado público.
- Causas solidarias, notificaciones, reportes y auditoría.
- API REST en Express con Prisma y MySQL, documentada con Swagger en desarrollo.
- Frontend en React con Vite y Tailwind.
- Pruebas con Vitest y Supertest, incluida una prueba de concurrencia de reservas.
- Docker Compose para desarrollo y producción, y scripts de respaldo de MySQL.
- Archivos de comunidad: licencia MIT, código de conducta, política de seguridad, guía de contribución y plantillas de GitHub.
