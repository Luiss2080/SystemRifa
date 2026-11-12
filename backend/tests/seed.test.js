import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/config/prisma.js';
import { runSeed } from '../prisma/seed.js';
import { resetDb } from './helpers/resetDb.js';

describe('Seed idempotente del sistema', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('carga exactamente 3 roles, 18 permisos, 13 tipos de notificación y el administrador', async () => {
    const [roles, permisos, tipos, admin] = await Promise.all([
      prisma.rol.findMany({ include: { permisos: true } }),
      prisma.permiso.findMany(),
      prisma.tipoNotificacion.findMany(),
      prisma.usuario.findUnique({
        where: { email: process.env.ADMIN_EMAIL },
        include: { roles: { include: { rol: true } } }
      })
    ]);

    expect(roles).toHaveLength(3);
    expect(permisos).toHaveLength(18);
    expect(tipos).toHaveLength(13);

    const rolAdmin = roles.find((r) => r.nombre === 'ADMINISTRADOR');
    const rolOrg = roles.find((r) => r.nombre === 'ORGANIZADOR');
    const rolPart = roles.find((r) => r.nombre === 'PARTICIPANTE');

    expect(rolAdmin.permisos).toHaveLength(18);
    expect(rolOrg.permisos).toHaveLength(5);
    expect(rolPart.permisos).toHaveLength(5);

    expect(admin).not.toBeNull();
    expect(admin.roles.map((r) => r.rol.nombre)).toContain('ADMINISTRADOR');
  });

  it('ejecutar el seed dos veces no duplica roles, permisos, tipos ni usuarios', async () => {
    await runSeed(prisma);

    const [rolesCount, permisosCount, tiposCount, usuariosCount, permisoRolCount] =
      await Promise.all([
        prisma.rol.count(),
        prisma.permiso.count(),
        prisma.tipoNotificacion.count(),
        prisma.usuario.count(),
        prisma.permisoRol.count()
      ]);

    expect(rolesCount).toBe(3);
    expect(permisosCount).toBe(18);
    expect(tiposCount).toBe(13);
    expect(usuariosCount).toBe(1);
    expect(permisoRolCount).toBe(18 + 5 + 5);
  });
});

