# Sistema de Rifas Solidarias

Plataforma web full-stack para gestionar rifas solidarias, reservas atómicas de tickets, verificación de pagos, sorteos criptográficos, notificaciones internas y reportes transparentes (**Desarrollo de Sistemas I · UPDS**).

## Stack Tecnológico

- **Frontend:** React 19 (Vite) + Tailwind CSS v4 + React Router + TanStack Query + Recharts + Axios
- **Backend:** Node.js 24 (ES Modules) + Express + Zod + JWT + bcrypt (cost 12) + Helmet + Express Rate Limit + Swagger UI (`development`)
- **Base de Datos y ORM:** Prisma ORM (`6.19.3`) + MySQL 8 (InnoDB)
- **Pruebas:** Vitest + Supertest + `@vitest/coverage-v8` contra `DATABASE_URL_TEST`

## Estructura del Monorepo

```text
SystemRifa/
├── docker-compose.yml         # MySQL local de desarrollo
├── docker-compose.prod.yml    # Despliegue productivo (MySQL + Backend + Frontend Nginx)
├── CHECKLIST.md               # Trazabilidad RF-01..RF-15 y RNF-01..RNF-10
├── scripts/
│   ├── backup-mysql.ps1       # Respaldo MySQL con rotación (Windows/Laragon)
│   └── backup-mysql.sh        # Respaldo MySQL con rotación (Linux/macOS)
├── backend/
│   ├── Dockerfile             # Multi-stage Node 24 no-root + prisma migrate deploy
│   ├── prisma/                # schema.prisma, migrations, seed.js, seed.demo.js
│   ├── src/                   # config, routes, controllers, services, repositories, middlewares, validators, utils, jobs
│   └── tests/                 # Suite modular + concurrencia + RNF-06 (10k tickets) + E2E
└── frontend/
    ├── Dockerfile             # Multi-stage Vite -> Nginx static + /api proxy
    ├── nginx.conf
    └── src/                   # api, components/ui, features, layouts, pages, routes, utils
```

## Requisitos Previos

- Node.js 20+ (probado en Node `24.15.0`) y npm
- MySQL 8.0 (local vía Laragon o con `docker-compose.yml`)

## Levantar en Desarrollo

1. **Base de datos MySQL 8**
   - Con Laragon o MySQL local asegúrate de tener creadas `rifas` y `rifas_test`:
     ```sql
     CREATE DATABASE IF NOT EXISTS rifas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     CREATE DATABASE IF NOT EXISTS rifas_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - O con Docker:
     ```bash
     docker compose up -d
     ```

2. **Configurar variables de entorno**
   - Copia `backend/.env.example` a `backend/.env` y configura `DATABASE_URL`, `DATABASE_URL_TEST` y un `JWT_ACCESS_SECRET` aleatorio.
   - Copia `frontend/.env.example` a `frontend/.env` (`VITE_API_URL=http://localhost:3000/api`).

3. **Backend: dependencias, migraciones y seeds**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   ```
   Opcionalmente, carga datos de demostración idempotentes (usa `SEED_DEMO_PASSWORD`, por defecto `Demo1234!`):
   ```bash
   npm run seed:demo
   ```
   - **Ejecución rápida desde la raíz del monorepo** (levanta backend en `3000` y frontend en `5173` a la vez):
     ```bash
     npm run dev
     ```
   - O inicia solo el servidor backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Documentación OpenAPI disponible solo en `NODE_ENV=development` en: `http://localhost:3000/api/docs`

4. **Frontend: dependencias y servidor de desarrollo**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Disponible en `http://localhost:5173`.

## Pruebas, Cobertura y Calidad

```bash
# Backend
cd backend
npm test           # Pruebas de integración, concurrencia, RNF-06 y E2E
npm run test:ci    # Pruebas + reporte de cobertura V8
npm run lint       # ESLint

# Frontend
cd frontend
npm run build      # Compilación Vite de producción
npm run lint       # ESLint
```

## Despliegue en Producción (Docker)

```bash
# Define MYSQL_ROOT_PASSWORD y JWT_ACCESS_SECRET en tu entorno o archivo .env raíz
docker compose -f docker-compose.prod.yml up -d --build
```
- Frontend Nginx + proxy `/api`: `http://localhost:8080`
- Backend API: `http://localhost:3000/api/health`

## Respaldo y Restauración de Base de Datos

- **Generar respaldo (Windows/PowerShell):**
  ```powershell
  .\scripts\backup-mysql.ps1 -DbName rifas
  ```
- **Generar respaldo (Linux/macOS):**
  ```bash
  ./scripts/backup-mysql.sh
  ```
- **Restaurar en una base limpia:**
  ```bash
  mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rifas_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -u root -p rifas_restore < backups/rifas_YYYYMMDD_HHMMSS.sql
  ```

## Decisiones de Seguridad y Arquitectura

- **Tokens en Frontend (`frontend/src/api/client.js`):** El `accessToken` JWT se mantiene únicamente en memoria JS; el `refreshToken` opaco con rotación y detección de reuso se persiste en `localStorage` para renovación silenciosa al recargar (trade-off frente a cookies `HttpOnly`: facilita entornos desacoplados sin CSRF aunque depende de mitigar XSS).
- **Concurrencia y dinero:** Todas las reservas usan `updateMany` condicional atómico en transacción (`READ COMMITTED` / `REPEATABLE READ`) con índice único `(rifaId, numeroTicket)`. Los montos operan en centavos enteros para evitar errores de punto flotante.
- **Privacidad en resultados:** `/api/rifas/:id/resultado` expone únicamente `alias` e iniciales (`N. A.`), ocultando email, teléfono y nombres completos.
