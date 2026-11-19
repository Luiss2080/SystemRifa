<div align="center">

<img src="docs/assets/logo.svg" alt="Logo de SystemRifa" width="96" />

# SystemRifa

**Plataforma web de rifas solidarias: organizá, vendé tickets y sorteá con total transparencia.**

![Estado](https://img.shields.io/badge/estado-v1.0.0-10b981?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-React%20%C2%B7%20Express%20%C2%B7%20Prisma-0d9488?style=for-the-badge)
![Base de datos](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge)
![Último commit](https://img.shields.io/github/last-commit/Luiss2080/SystemRifa?style=for-the-badge)
![PRs bienvenidos](https://img.shields.io/badge/PRs-bienvenidos-brightgreen?style=for-the-badge)

[Demo](https://rifas-demo.onrender.com/) · [Documentación](docs/README.md) · [Hoja de ruta](docs/ROADMAP.md) · [Changelog](CHANGELOG.md) · [Contribuir](CONTRIBUTING.md)

</div>

---

## 🎬 Vista rápida

SystemRifa es un proyecto de **Desarrollo de Sistemas I (UPDS)**. Permite que organizaciones publiquen rifas con fines solidarios, que los participantes reserven y paguen tickets, y que el sorteo se realice de forma verificable y sin repeticiones.

Podés probar una demo en [rifas-demo.onrender.com](https://rifas-demo.onrender.com/). Corre en un plan gratuito, así que la primera carga puede tardar unos segundos.

## ✨ Características

| Característica | Detalle |
|---|---|
| 🔐 Autenticación | Registro e inicio de sesión con JWT de acceso y refresh token rotativo |
| 👥 Roles y permisos | Administrador, organizador y participante, con historial inmutable de cambios de permisos |
| 📝 Solicitud de rifas | Flujo con estados y aprobación administrativa |
| 🎟️ Tickets | Numeración 1..N con restricción única por rifa y liberación automática de reservas vencidas |
| 💳 Pagos | Pago pendiente y verificación administrativa, con bloqueo de doble confirmación |
| 🎲 Sorteo | Selección criptográfica solo entre tickets vendidos, con resultado público |
| 🔔 Extras | Causas solidarias, notificaciones, reportes y auditoría |

## 🏗️ Arquitectura

Monorepo con backend y frontend independientes.

<details>
<summary>Estructura de carpetas</summary>

```
SystemRifa/
├── backend/            # API Express + Prisma (Node, ESM)
├── frontend/           # React + Vite + Tailwind (servido con Nginx en producción)
├── database/           # Recursos de base de datos
├── docker/mysql/       # Configuración de MySQL para Docker
├── scripts/            # Respaldos de MySQL (.sh / .ps1)
├── docs/               # Documentación y recursos gráficos
├── docker-compose.yml        # MySQL para desarrollo
└── docker-compose.prod.yml   # MySQL + Backend + Frontend
```

</details>

## 🚀 Inicio rápido

| Requisito | Versión |
|---|---|
| Node.js | 24 |
| MySQL | 8 (o Docker) |

```bash
git clone https://github.com/Luiss2080/SystemRifa.git
cd SystemRifa
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cp backend/.env.example backend/.env   # completá las variables
cd backend && npx prisma generate && npx prisma migrate deploy && npm run seed && cd ..
npm run dev
```

Para levantar solo MySQL con Docker: `docker compose up -d`. Para producción: `docker compose -f docker-compose.prod.yml up -d --build`.

<details>
<summary>Variables de entorno</summary>

**Backend** (`backend/.env`): `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `DATABASE_URL_TEST`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TTL`, `REFRESH_TTL`, `TARIFA_PUBLICACION`, `RESERVA_MINUTOS`, `MAX_TICKETS_POR_RESERVA`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

**Frontend** (`frontend/.env`): `VITE_API_URL`, `VITE_DEMO_ADMIN_EMAIL`, `VITE_DEMO_ADMIN_PASSWORD`, `VITE_DEMO_ORG_EMAIL`, `VITE_DEMO_ORG_PASSWORD`.

Usá secretos propios y largos en producción; nunca subas archivos `.env`.

</details>

## 🧪 Pruebas

```bash
npm test            # pruebas del backend
npm run test:ci      # con cobertura
```

Las pruebas usan Vitest y Supertest contra una base separada (`DATABASE_URL_TEST`) y cubren autenticación, tickets, pagos, sorteo, permisos, notificaciones y reportes. Incluyen una prueba de concurrencia: 20 reservas simultáneas del mismo ticket dan 1 éxito y 19 respuestas 409.

## 🔒 Seguridad

- Contraseñas con bcrypt (cost 12) y sesiones con JWT y refresh token rotativo.
- Helmet, límite de peticiones y validación de entradas con Zod.
- Pagos y cambios de permisos quedan en auditoría.

Para reportar una vulnerabilidad, mirá la [política de seguridad](SECURITY.md).

## 🚧 Lo que todavía no existe

- No hay pasarela de pago real: la verificación del pago es administrativa.
- No hay integración continua configurada en GitHub Actions.

Más ideas en la [hoja de ruta](docs/ROADMAP.md). Los requisitos funcionales y no funcionales están en el [CHECKLIST](CHECKLIST.md).

## 🤝 Contribuir

Las contribuciones son bienvenidas. Leé la [guía de contribución](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

## 📄 Licencia

Distribuido bajo licencia MIT. Mirá el archivo [LICENSE](LICENSE).
