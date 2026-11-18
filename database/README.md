# Base de Datos · Migraciones y Seeders (Sistema de Rifas Solidarias)

Este directorio contiene las definiciones de esquema, migraciones e inicializadores (seeders) de la base de datos MySQL/MariaDB del Sistema de Rifas Solidarias.

---

## 📁 Archivos Disponibles

1. **`schema_and_seeders_complete.sql`**:
   - Script SQL completo y autónomo compatible con Laragon, HeidiSQL, MySQL Workbench y phpMyAdmin.
   - Crea la base de datos `system_rifa`, las 14 tablas relacionales con sus índices optimizados (`pago_rifaId_estado_idx`, `ticket_estado_reservadoHasta_idx`), llaves foráneas y borrado en cascada.
   - Inserta automáticamente:
     - **3 Roles del sistema**: `ADMINISTRADOR`, `ORGANIZADOR`, `PARTICIPANTE`.
     - **18 Permisos granulares** y su matriz de asignación por rol.
     - **13 Tipos de notificación** actualizados con variables amigables (`{nombre}` y `{alias}`).
     - **6 Causas solidarias verificadas** (Albergue animal, salud, educación, etc.).
     - **7 Usuarios demo** con credenciales listas para probar.
     - **Rifas activas y finalizadas**, boletos generados, pagos verificados y sorteo auditado.

---

## 🚀 Métodos de Inicialización

### Opción A: Importación directa en Laragon (1 clic)
1. Abre **Laragon** y asegúrate de que MySQL esté iniciado.
2. Abre **HeidiSQL** o **phpMyAdmin**.
3. Abre el archivo `database/schema_and_seeders_complete.sql` y pulsa **Ejecutar (F9)**.
4. ¡Listo! La base de datos `system_rifa` quedará 100% operativa y poblada.

---

### Opción B: Ejecutar mediante scripts NPM del proyecto
Desde la terminal en la raíz del proyecto (`c:\laragon\www\SystemRifa`):

```bash
# Ejecutar seed base (roles, permisos, plantillas y admin)
npm run seed

# Ejecutar seed demo ampliado (causas, usuarios, rifas, tickets y pagos)
npm run seed:demo
```

---

### Opción C: Prisma CLI (Migraciones de desarrollo)
Desde el directorio `backend`:

```bash
cd backend

# Aplicar migraciones existentes
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate

# Ejecutar seeder de demostración
node prisma/seed.demo.js
```

---

## 👥 Cuentas de Demostración Disponibles

Todas las cuentas de prueba comparten la contraseña común:
**`Demo1234!`** (o la configurada en tu archivo `.env`).

| Rol | Correo Electrónico | Alias | Propósito |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@rifas.local` | `@admin` | Control total, aprobación de solicitudes, verificación de pagos, gestión de usuarios y plantillas. |
| **Organizador** | `organizador@rifas.local` | `@OrgSolidario` | Gestión de campañas propias, premios, sorteo en vivo y actas de entrega. |
| **Organizador 2** | `organizador2@rifas.local` | `@LuciaCausa` | Gestión de rifa escolar "Semillas del Saber". |
| **Participante** | `participante1@rifas.local` | `@AnaSolidaria` | Compra y reserva de boletos, registro de pagos QR. |
| **Participante 2** | `participante2@rifas.local` | `@LuisSolidario` | Comprador con tickets confirmados. |
| **Participante 3** | `participante3@rifas.local` | `@MariaSolidaria` | Participante con comprobante pendiente de verificación. |
| **Participante 4** | `participante4@rifas.local` | `@DiegoV` | Participante regular de la comunidad. |
