# Demo pública de SystemRifa

Rama `demo`: despliegue en Render con Docker. Un solo contenedor con MySQL 8 embebido, API Express y frontend React servido por nginx. No usa base de datos externa.

## Accesos

| Rol | Correo | Clave |
| --- | --- | --- |
| Administrador | admin@hagamostech.com | password |
| Organizador | organizador@rifas.local | password |
| Participante | participante1@rifas.local | password |

## Notas

- Los datos son de demostración (causas, rifas, tickets y pagos de ejemplo en Santa Cruz de la Sierra, montos en bolivianos).
- Render gratis duerme el servicio tras un rato sin uso: la primera visita tarda cerca de 1 minuto y los datos se reinician en cada arranque.
- Esta rama no cambia `main`.
