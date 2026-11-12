import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';

function fechasFuturas() {
  const inicio = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return { inicio, fin };
}

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

describe('Causas, Solicitudes y Aprobación de Rifas (Paso 6)', () => {
  const originalTarifa = process.env.TARIFA_PUBLICACION;

  beforeEach(async () => {
    process.env.TARIFA_PUBLICACION = '0';
    await resetDb();
  });

  afterEach(() => {
    process.env.TARIFA_PUBLICACION = originalTarifa;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('CRUD de causas público en lectura, protegido en escritura y bloquea borrado si está en uso', async () => {
    const admin = await loginAdmin();
    const part = await registrarYLoguear({
      alias: 'causa_user',
      email: 'causa@ejemplo.com',
      nombres: 'Causa',
      apellidos: 'User',
      password: 'Password123'
    });

    // Participante no puede crear causa
    await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({ nombre: 'Hogar Niños' })
      .expect(403);

    // Admin crea causa
    const created = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        nombre: 'Apoyo Hospital Oncológico',
        descripcion: 'Recaudación para insumos médicos',
        meta: 15000
      })
      .expect(201);

    expect(created.body.causa.meta).toBe('15000.00');
    const causaId = created.body.causa.causaId;

    // Público puede listar y consultar detalle
    const pubList = await request(app).get('/api/causas').expect(200);
    expect(pubList.body.items).toHaveLength(1);
    await request(app).get(`/api/causas/${causaId}`).expect(200);

    // Asociar solicitud a la causa impide borrarla
    const { inicio, fin } = fechasFuturas();
    await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({
        nombre: 'Rifa Solidaria Mayo',
        precioTicket: 20,
        cantidadTickets: 50,
        fechaInicio: inicio,
        fechaFin: fin,
        causaId
      })
      .expect(201);

    await request(app)
      .delete(`/api/causas/${causaId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(409);

    // Una causa sin asociaciones sí se puede borrar
    const otra = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombre: 'Causa Libre' })
      .expect(201);

    await request(app)
      .delete(`/api/causas/${otra.body.causa.causaId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('tarifa 0 permite REVISION -> PAGO_CONFIRMADO y bloquea ESPERANDO_PAGO; tarifa > 0 exige referencia', async () => {
    const admin = await loginAdmin();
    const part = await registrarYLoguear({
      alias: 'sol_user',
      email: 'sol@ejemplo.com',
      nombres: 'Sol',
      apellidos: 'Test',
      password: 'Password123'
    });

    const { inicio, fin } = fechasFuturas();
    const s1 = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({
        nombre: 'Rifa Tarifa Cero',
        precioTicket: 15,
        cantidadTickets: 25,
        fechaInicio: inicio,
        fechaFin: fin
      })
      .expect(201);

    const id1 = s1.body.solicitud.rifaSolicitadaId;

    // Notificaciones de creación: SOLICITUD_RECIBIDA al usuario y NUEVA_SOLICITUD al admin
    const notifsUser = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(200);
    expect(notifsUser.body.items.map((n) => n.codigo)).toContain('SOLICITUD_RECIBIDA');

    const notifsAdmin = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(notifsAdmin.body.items.map((n) => n.codigo)).toContain('NUEVA_SOLICITUD');

    // Con tarifa 0, ESPERANDO_PAGO responde 409
    await request(app)
      .patch(`/api/solicitudes/${id1}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'ESPERANDO_PAGO' })
      .expect(409);

    // Con tarifa 0, REVISION -> PAGO_CONFIRMADO funciona
    await request(app)
      .patch(`/api/solicitudes/${id1}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(200);

    // Con tarifa > 0, REVISION -> PAGO_CONFIRMADO responde 409
    process.env.TARIFA_PUBLICACION = '50';
    const s2 = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({
        nombre: 'Rifa Con Tarifa',
        precioTicket: 25,
        cantidadTickets: 30,
        fechaInicio: inicio,
        fechaFin: fin
      })
      .expect(201);
    const id2 = s2.body.solicitud.rifaSolicitadaId;

    await request(app)
      .patch(`/api/solicitudes/${id2}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(409);

    await request(app)
      .patch(`/api/solicitudes/${id2}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'ESPERANDO_PAGO' })
      .expect(200);

    // Sin referenciaPago falla con 400
    await request(app)
      .patch(`/api/solicitudes/${id2}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(400);

    // Con referenciaPago pasa a PAGO_CONFIRMADO
    const conf = await request(app)
      .patch(`/api/solicitudes/${id2}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO', referenciaPago: 'QR-987654' })
      .expect(200);
    expect(conf.body.solicitud.referenciaPago).toBe('QR-987654');
  });

  it('aprobar crea rifa y exactamente N tickets numerados 1..N, otorga ORGANIZADOR y bloquea doble aprobación (409)', async () => {
    const admin = await loginAdmin();
    const part = await registrarYLoguear({
      alias: 'org_nuevo',
      email: 'org@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Nuevo',
      password: 'Password123'
    });
    const otro = await registrarYLoguear({
      alias: 'curioso',
      email: 'curioso@ejemplo.com',
      nombres: 'Otro',
      apellidos: 'User',
      password: 'Password123'
    });

    const causa = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombre: 'Refugio Animal', meta: 5000 })
      .expect(201);

    const { inicio, fin } = fechasFuturas();
    const sol = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({
        nombre: 'Rifa Refugio',
        precioTicket: 10,
        cantidadTickets: 40,
        fechaInicio: inicio,
        fechaFin: fin,
        causaId: causa.body.causa.causaId
      })
      .expect(201);
    const solicitudId = sol.body.solicitud.rifaSolicitadaId;

    // Otro participante no puede ver la solicitud ajena
    await request(app)
      .get(`/api/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${otro.accessToken}`)
      .expect(403);

    // Dueño sí puede ver la suya
    await request(app)
      .get(`/api/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(200);

    // No se puede aprobar sin PAGO_CONFIRMADO -> 409
    await request(app)
      .post(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(409);

    // Pasar a PAGO_CONFIRMADO y aprobar con ajuste de cantidadTickets = 50
    await request(app)
      .patch(`/api/solicitudes/${solicitudId}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(200);

    const aprob = await request(app)
      .post(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ cantidadTickets: 50, precioTicket: 12 })
      .expect(200);

    expect(aprob.body.solicitud.estado).toBe('APROBADA');
    expect(aprob.body.rifa.estado).toBe('ACTIVA');
    expect(aprob.body.rifa.cantidadTickets).toBe(50);
    expect(aprob.body.rifa.precioTicket).toBe('12.00');

    // Verificar exactamente 50 tickets numerados 1..50 sin huecos
    const tickets = await prisma.ticket.findMany({
      where: { rifaId: aprob.body.rifa.rifaId },
      orderBy: { numeroTicket: 'asc' }
    });
    expect(tickets).toHaveLength(50);
    expect(tickets.map((t) => t.numeroTicket)).toEqual(
      Array.from({ length: 50 }, (_, idx) => idx + 1)
    );
    expect(tickets.every((t) => t.estado === 'DISPONIBLE')).toBe(true);

    // El solicitante ahora tiene rol ORGANIZADOR además de PARTICIPANTE
    const meOrg = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(200);
    expect(meOrg.body.roles).toContain('ORGANIZADOR');
    expect(meOrg.body.roles).toContain('PARTICIPANTE');

    // Doble aprobación -> 409
    await request(app)
      .post(`/api/solicitudes/${solicitudId}/aprobar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(409);

    // Auditoría registrada
    const audits = await prisma.auditoria.findMany({
      where: { entidad: 'rifa_solicitada', entidadId: solicitudId }
    });
    expect(audits.map((a) => a.accion)).toContain('APROBAR_SOLICITUD');
  });

  it('rechazar exige observación, notifica SOLICITUD_RECHAZADA y bloquea nuevas transiciones', async () => {
    const admin = await loginAdmin();
    const part = await registrarYLoguear({
      alias: 'rechazo_u',
      email: 'rechazo@ejemplo.com',
      nombres: 'Rechazo',
      apellidos: 'Test',
      password: 'Password123'
    });

    const { inicio, fin } = fechasFuturas();
    const sol = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .send({
        nombre: 'Rifa Incompleta',
        precioTicket: 10,
        cantidadTickets: 10,
        fechaInicio: inicio,
        fechaFin: fin
      })
      .expect(201);
    const solicitudId = sol.body.solicitud.rifaSolicitadaId;

    // Sin observación -> 400
    await request(app)
      .patch(`/api/solicitudes/${solicitudId}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'RECHAZADA' })
      .expect(400);

    // Con observación -> RECHAZADA
    const rech = await request(app)
      .patch(`/api/solicitudes/${solicitudId}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'RECHAZADA', observacion: 'Falta detalle de causa' })
      .expect(200);
    expect(rech.body.solicitud.estado).toBe('RECHAZADA');
    expect(rech.body.solicitud.fechaResolucion).not.toBeNull();

    // No admite transición posterior -> 409
    await request(app)
      .patch(`/api/solicitudes/${solicitudId}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(409);

    const notifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${part.accessToken}`)
      .expect(200);
    expect(notifs.body.items.map((n) => n.codigo)).toContain('SOLICITUD_RECHAZADA');
  });
});

