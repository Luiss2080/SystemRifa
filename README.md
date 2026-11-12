# Sistema de Rifas Solidarias

Proyecto desarrollado paso a paso siguiendo la guía de desarrollo de **Desarrollo de Sistemas I (UPDS, Grupo 4)**.

## Stack Tecnológico

- **Frontend:** React (Vite) + Tailwind CSS *(Paso 11 en adelante)*
- **Backend:** Node.js 20+ + Express (ES Modules, arquitectura `routes → controllers → services → repositories`)
- **ORM y Base de Datos:** Prisma ORM + MySQL 8 (InnoDB)
- **Pruebas:** Vitest + Supertest contra `DATABASE_URL_TEST`

## Estructura del Monorepo

```text
SystemRifa/
├── docker-compose.yml
├── docker/mysql/init.sql
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── jobs/
│   ├── tests/
│   └── .env.example
└── frontend/
    └── .env.example
```

## Requisitos Previos

- Node.js 20 o superior y npm
- MySQL 8 (local vía Laragon o mediante Docker Compose)

## Levantar desde cero (Desarrollo)

1. **Base de datos MySQL 8**
   - **Opción A (Laragon MySQL local):** asegúrate de que MySQL 8 esté iniciado y crea las bases `rifas` y `rifas_test`:
     ```sql
     CREATE DATABASE IF NOT EXISTS rifas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     CREATE DATABASE IF NOT EXISTS rifas_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - **Opción B (Docker):**
     ```bash
     docker compose up -d
     ```

2. **Configurar variables de entorno del backend**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edita `backend/.env` con tus credenciales locales y secretos JWT aleatorios (nunca subas `.env` al repositorio).

3. **Instalar dependencias y generar cliente Prisma**
   ```bash
   cd backend
   npm install
   npx prisma generate
   ```

4. **Migraciones y Seed** *(disponible a partir del Paso 2)*
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Ejecutar el servidor y las pruebas**
   ```bash
   npm run dev     # API en http://localhost:3000
   npm test        # Pruebas automáticas contra DATABASE_URL_TEST
   npm run lint    # Verificación ESLint
   ```

6. **Verificar salud de la API**
   ```bash
   curl http://localhost:3000/api/health
   ```
