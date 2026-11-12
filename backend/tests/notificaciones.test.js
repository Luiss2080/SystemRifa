import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';
import * as notificacionService from '../src/services/notificacion.service.js';
import * as notificacionRepo from '../src/repositories/notificacion.repository.js';

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
    accessToken: login.body.accessToken
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

describe('Notificaciones y Plantillas (Paso 5)', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('el registro envía BIENVENIDA renderizada y se lista con contador de no leídas', async () => {
    const user = await registrarYLoguear({
      alias: 'elena_s',
      email: 'elena@ejemplo.com',
      nombres: 'Elena',
      apellidos: 'Sánchez',
      password: 'Password123'
    });

    const res = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${user.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.noLeidasCount).toBe(1);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].codigo).toBe('BIENVENIDA');
    expect(res.body.items[0].titulo).toContain('elena_s');
    expect(res.body.items[0].mensaje).toContain('elena_s');
    expect(res.body.items[0].leida).toBe(false);
  });

  it('valida variables en plantillas y rechaza variables no admitidas con 400', async () => {
    const admin = await loginAdmin();
    const user = await registrarYLoguear({
      alias: 'mario_p',
      email: 'mario@ejemplo.com',
      nombres: 'Mario',
      apellidos: 'Paz',
      password: 'Password123'
    });

    // Participante no accede a plantillas
    await request(app)
      .get('/api/tipos-notificacion')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);

    const tiposRes = await request(app)
      .get('/api/tipos-notificacion')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const bienvenida = tiposRes.body.items.find((t) => t.codigo === 'BIENVENIDA');

    // Variable no admitida rechazada
    const badPatch = await request(app)
      .patch(`/api/tipos-notificacion/${bienvenida.tipoNotificacionId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ plantillaMensaje: 'Hola {alias}, tu clave es {secreto}' });
    expect(badPatch.status).toBe(400);
    expect(badPatch.body.error.code).toBe('INVALID_TEMPLATE_VARIABLE');

    // Variable admitida aceptada
    const okPatch = await request(app)
      .patch(`/api/tipos-notificacion/${bienvenida.tipoNotificacionId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ plantillaTitulo: 'Hola {alias}, bienvenido' });
    expect(okPatch.status).toBe(200);
    expect(okPatch.body.tipo.plantillaTitulo).toBe('Hola {alias}, bienvenido');
  });

  it('un usuario no puede leer, marcar ni eliminar notificaciones ajenas y puede gestionar las propias', async () => {
    const userA = await registrarYLoguear({
      alias: 'usuario_a',
      email: 'a@ejemplo.com',
      nombres: 'Usuario',
      apellidos: 'Uno',
      password: 'Password123'
    });
    const userB = await registrarYLoguear({
      alias: 'usuario_b',
      email: 'b@ejemplo.com',
      nombres: 'Usuario',
      apellidos: 'Dos',
      password: 'Password123'
    });

    await notificacionService.notificar('SOLICITUD_RECIBIDA', [userA.usuario.usuarioId], {
      nombreRifa: 'Rifa Esperanza'
    });

    const listA = await request(app)
      .get('/api/notificaciones?noLeidas=true')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(listA.body.noLeidasCount).toBe(2);

    const notifIdDeA = listA.body.items[0].notificacionId;

    // Usuario B no puede marcar ni eliminar la de A
    await request(app)
      .patch(`/api/notificaciones/${notifIdDeA}/leida`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);

    await request(app)
      .delete(`/api/notificaciones/${notifIdDeA}`)
      .set('Authorization', `Bearer ${userB.accessToken}`)
      .expect(404);

    // Usuario A marca una como leída
    await request(app)
      .patch(`/api/notificaciones/${notifIdDeA}/leida`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const trasUna = await request(app)
      .get('/api/notificaciones?noLeidas=true')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(trasUna.body.noLeidasCount).toBe(1);
    expect(trasUna.body.items).toHaveLength(1);

    // Usuario A marca todas y elimina una
    await request(app)
      .patch('/api/notificaciones/leidas')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    await request(app)
      .delete(`/api/notificaciones/${notifIdDeA}`)
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const trasBorrar = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);
    expect(trasBorrar.body.noLeidasCount).toBe(0);
    expect(trasBorrar.body.items).toHaveLength(1);
  });

  it('notificarConPermiso entrega solo a usuarios activos con el permiso', async () => {
    const admin = await loginAdmin();
    await registrarYLoguear({
      alias: 'part_sin_perm',
      email: 'sinperm@ejemplo.com',
      nombres: 'Sin',
      apellidos: 'Permiso',
      password: 'Password123'
    });

    await notificacionService.notificarConPermiso('NUEVA_SOLICITUD', 'solicitudes:revisar', {
      alias: 'part_sin_perm',
      nombreRifa: 'Rifa Solidaria 1'
    });

    const adminNotifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(adminNotifs.body.items).toHaveLength(1);
    expect(adminNotifs.body.items[0].codigo).toBe('NUEVA_SOLICITUD');
    expect(adminNotifs.body.items[0].mensaje).toContain('Rifa Solidaria 1');
  });

  it('un fallo en el envío de notificación no rompe el registro de usuario (Regla 9)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(notificacionRepo, 'findTipoByCodigo').mockRejectedValueOnce(
      new Error('Fallo simulado de BD al notificar')
    );

    const reg = await request(app).post('/api/auth/registro').send({
      alias: 'resiliente',
      email: 'resiliente@ejemplo.com',
      nombres: 'Test',
      apellidos: 'Resiliente',
      password: 'Password123'
    });

    expect(reg.status).toBe(201);
    expect(reg.body.usuario.alias).toBe('resiliente');
    expect(errSpy).toHaveBeenCalled();
  });
});

