import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';
import { assertPropietarioORAdmin, esAdmin } from '../src/middlewares/authorize.js';

async function registrarYLoguear(datos) {
  const reg = await request(app).post('/api/auth/registro').send(datos);
  expect(reg.status).toBe(201);
  const login = await request(app).post('/api/auth/login').send({
    email: datos.email,
    password: datos.password
  });
  expect(login.status).toBe(200);
  return {
    usuario: reg.body.usuario,
    accessToken: login.body.accessToken,
    refreshToken: login.body.refreshToken
  };
}

async function loginAdmin() {
  const login = await request(app).post('/api/auth/login').send({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });
  expect(login.status).toBe(200);
  return login.body;
}

describe('Roles, Permisos, Usuarios y Auditoría (Paso 4)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('un participante recibe 403 al acceder a endpoints administrativos y un administrador sí puede', async () => {
    const part = await registrarYLoguear({
      alias: 'juan_p',
      email: 'juan@ejemplo.com',
      nombres: 'Juan',
      apellidos: 'López',
      password: 'Password123'
    });
    const admin = await loginAdmin();

    const roles = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(roles.status).toBe(200);
    const orgRole = roles.body.items.find((r) => r.nombre === 'ORGANIZADOR');

    const partForbiddenUsers = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${part.accessToken}`);
    expect(partForbiddenUsers.status).toBe(403);

    const partForbiddenRole = await request(app)
      .put(`/api/usuarios/${part.usuario.usuarioId}/roles/${orgRole.rolId}`)
      .set('Authorization', `Bearer ${part.accessToken}`);
    expect(partForbiddenRole.status).toBe(403);

    const adminAssign = await request(app)
      .put(`/api/usuarios/${part.usuario.usuarioId}/roles/${orgRole.rolId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(adminAssign.status).toBe(200);

    const efectivos = await request(app)
      .get(`/api/usuarios/${part.usuario.usuarioId}/permisos-efectivos`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(efectivos.status).toBe(200);
    expect(efectivos.body.roles).toContain('ORGANIZADOR');
    expect(efectivos.body.permisosEfectivos).toContain('sorteos:realizar');
  });

  it('cada cambio de rol o permiso queda registrado en historial_permiso dentro de la transacción', async () => {
    const part = await registrarYLoguear({
      alias: 'lucia_p',
      email: 'lucia@ejemplo.com',
      nombres: 'Lucía',
      apellidos: 'Rojas',
      password: 'Password123'
    });
    const admin = await loginAdmin();

    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    const orgRole = rolesRes.body.items.find((r) => r.nombre === 'ORGANIZADOR');

    await request(app)
      .put(`/api/usuarios/${part.usuario.usuarioId}/roles/${orgRole.rolId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await request(app)
      .delete(`/api/usuarios/${part.usuario.usuarioId}/roles/${orgRole.rolId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const histRes = await request(app)
      .get('/api/historial-permisos')
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(histRes.status).toBe(200);
    expect(histRes.body.items).toHaveLength(2);
    const ops = histRes.body.items.map((h) => h.operacion);
    expect(ops).toContain('ASIGNAR_ROL');
    expect(ops).toContain('QUITAR_ROL');
  });

  it('permiso directo autoriza al usuario y al desactivarse (estaActivo=false) deja de autorizar', async () => {
    const part = await registrarYLoguear({
      alias: 'pedro_p',
      email: 'pedro@ejemplo.com',
      nombres: 'Pedro',
      apellidos: 'Mendoza',
      password: 'Password123'
    });
    const admin = await loginAdmin();

    const permisosRes = await request(app)
      .get('/api/permisos')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    const permCausas = permisosRes.body.items.find(
      (p) => p.recurso === 'usuarios' && p.accion === 'leer'
    );

    // Antes no tiene usuarios:leer
    await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(403);

    // Asignar permiso directo
    await request(app)
      .put(`/api/usuarios/${part.usuario.usuarioId}/permisos/${permCausas.permisoId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    // Ahora sí autoriza (caché invalidada)
    await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(200);

    // Desactivar el permiso globalmente
    await request(app)
      .patch(`/api/permisos/${permCausas.permisoId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estaActivo: false })
      .expect(200);

    // Permiso desactivado ya no autoriza
    await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(403);
  });

  it('protege roles del sistema, permisos en uso, último administrador y auto-desactivación', async () => {
    const admin = await loginAdmin();

    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    const adminRole = rolesRes.body.items.find((r) => r.nombre === 'ADMINISTRADOR');

    // No se puede borrar rol del sistema
    const delSystemRole = await request(app)
      .delete(`/api/roles/${adminRole.rolId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(delSystemRole.status).toBe(409);

    // No se puede quitar el último administrador
    const removeLastAdmin = await request(app)
      .delete(`/api/usuarios/${admin.usuario.usuarioId}/roles/${adminRole.rolId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(removeLastAdmin.status).toBe(409);

    // Un administrador no puede desactivarse a sí mismo
    const selfDeactivate = await request(app)
      .patch(`/api/usuarios/${admin.usuario.usuarioId}/activo`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ activo: false });
    expect(selfDeactivate.status).toBe(409);

    // Permiso en uso requiere confirmar=true para eliminarse
    const customPerm = await request(app)
      .post('/api/permisos')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombre: 'Prueba custom', recurso: 'prueba', accion: 'ver' })
      .expect(201);

    await request(app)
      .put(`/api/roles/${adminRole.rolId}/permisos/${customPerm.body.permiso.permisoId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await request(app)
      .delete(`/api/permisos/${customPerm.body.permiso.permisoId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(409);

    await request(app)
      .delete(`/api/permisos/${customPerm.body.permiso.permisoId}?confirmar=true`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('desactivar un usuario revoca sesiones, impide login (403) y registra en auditoria', async () => {
    const part = await registrarYLoguear({
      alias: 'sofia_p',
      email: 'sofia@ejemplo.com',
      nombres: 'Sofía',
      apellidos: 'Vargas',
      password: 'Password123'
    });
    const admin = await loginAdmin();

    const resDeactivate = await request(app)
      .patch(`/api/usuarios/${part.usuario.usuarioId}/activo`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ activo: false });
    expect(resDeactivate.status).toBe(200);
    expect(resDeactivate.body.usuario.activo).toBe(false);

    // No puede usar su accessToken ni iniciar sesión
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(403);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'sofia@ejemplo.com', password: 'Password123' })
      .expect(403);

    const audits = await prisma.auditoria.findMany({
      where: { entidad: 'usuario', entidadId: part.usuario.usuarioId }
    });
    expect(audits).toHaveLength(1);
    expect(audits[0].accion).toBe('DESACTIVAR_USUARIO');
  });

  it('helpers esAdmin y assertPropietarioORAdmin validan correctamente la propiedad', () => {
    expect(esAdmin({ roles: ['ADMINISTRADOR'] })).toBe(true);
    expect(esAdmin({ roles: ['ORGANIZADOR'] })).toBe(false);

    expect(() =>
      assertPropietarioORAdmin({ usuarioId: 1, roles: ['ADMINISTRADOR'] }, { usuarioCreadorId: 99 })
    ).not.toThrow();

    expect(() =>
      assertPropietarioORAdmin({ usuarioId: 5, roles: ['ORGANIZADOR'] }, { usuarioCreadorId: 5 })
    ).not.toThrow();

    expect(() =>
      assertPropietarioORAdmin({ usuarioId: 5, roles: ['ORGANIZADOR'] }, { usuarioCreadorId: 99 })
    ).toThrow(/propietario/i);
  });
});

