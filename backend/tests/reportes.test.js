import { performance } from 'node:perf_hooks';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';

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

describe('Reportes y Auditoría (Paso 10)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('los totales coinciden, solo suman pagos CONFIRMADOS y respeta permisos por rol/propiedad', async () => {
    const admin = await loginAdmin();
    const org1 = await registrarYLoguear({
      alias: 'org_rep1',
      email: 'orgrep1@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Rep Uno',
      password: 'Password123'
    });
    const org2 = await registrarYLoguear({
      alias: 'org_rep2',
      email: 'orgrep2@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Rep Dos',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_rep',
      email: 'comprep@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Rep',
      password: 'Password123'
    });

    const causa = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombre: 'Comedor Comunitario', meta: 1000 })
      .expect(201);
    const causaId = causa.body.causa.causaId;

    const inicio = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    async function crearYAprobar(token, nombre) {
      const sol = await request(app)
        .post('/api/solicitudes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre,
          precioTicket: 25,
          cantidadTickets: 10,
          fechaInicio: inicio,
          fechaFin: fin,
          causaId
        })
        .expect(201);

      await request(app)
        .patch(`/api/solicitudes/${sol.body.solicitud.rifaSolicitadaId}/estado`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ estado: 'PAGO_CONFIRMADO' })
        .expect(200);

      const aprob = await request(app)
        .post(`/api/solicitudes/${sol.body.solicitud.rifaSolicitadaId}/aprobar`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({})
        .expect(200);

      const rId = aprob.body.rifa.rifaId;
      await request(app)
        .post(`/api/rifas/${rId}/premios`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Premio Rep' })
        .expect(201);

      return rId;
    }

    const rifa1Id = await crearYAprobar(org1.accessToken, 'Rifa Rep 1');
    const rifa2Id = await crearYAprobar(org2.accessToken, 'Rifa Rep 2');

    // Comprar 2 tickets (Bs 50.00 CONFIRMADO), dejar 1 pago de 2 tickets PENDIENTE (Bs 50.00) y 1 pago de 1 ticket RECHAZADO (Bs 25.00)
    await request(app)
      .post(`/api/rifas/${rifa1Id}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [1, 2] })
      .expect(201);

    const tConfirmar = await prisma.ticket.findMany({
      where: { rifaId: rifa1Id, numeroTicket: { in: [1, 2] } }
    });
    const pagoConf = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ rifaId: rifa1Id, ticketIds: tConfirmar.map((t) => t.ticketId), metodo: 'QR' })
      .expect(201);
    await request(app)
      .patch(`/api/pagos/${pagoConf.body.pago.pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: true })
      .expect(200);

    // Pago pendiente
    await request(app)
      .post(`/api/rifas/${rifa1Id}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [3, 4] })
      .expect(201);
    const tPend = await prisma.ticket.findMany({
      where: { rifaId: rifa1Id, numeroTicket: { in: [3, 4] } }
    });
    await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ rifaId: rifa1Id, ticketIds: tPend.map((t) => t.ticketId), metodo: 'QR' })
      .expect(201);

    // Pago rechazado
    await request(app)
      .post(`/api/rifas/${rifa1Id}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [5] })
      .expect(201);
    const tRech = await prisma.ticket.findMany({
      where: { rifaId: rifa1Id, numeroTicket: { in: [5] } }
    });
    const pagoRech = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ rifaId: rifa1Id, ticketIds: tRech.map((t) => t.ticketId), metodo: 'QR' })
      .expect(201);
    await request(app)
      .patch(`/api/pagos/${pagoRech.body.pago.pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: false, motivo: 'Sin respaldo' })
      .expect(200);

    // Organizador dueño ve su reporte
    const repOrg1 = await request(app)
      .get(`/api/reportes/rifas/${rifa1Id}`)
      .set('Authorization', `Bearer ${org1.accessToken}`)
      .expect(200);

    expect(repOrg1.body.ticketsPorEstado).toEqual({
      DISPONIBLE: 6,
      RESERVADO: 2,
      VENDIDO: 2,
      ANULADO: 0
    });
    expect(repOrg1.body.porcentajeVendido).toBe(20);
    expect(repOrg1.body.recaudacionConfirmada).toBe('50.00');
    expect(repOrg1.body.recaudacionPendiente).toBe('50.00');

    // Organizador ajeno recibe 403 en rifa1 y en reportes globales
    await request(app)
      .get(`/api/reportes/rifas/${rifa1Id}`)
      .set('Authorization', `Bearer ${org2.accessToken}`)
      .expect(403);
    await request(app)
      .get('/api/reportes/causas')
      .set('Authorization', `Bearer ${org1.accessToken}`)
      .expect(403);
    await request(app)
      .get('/api/reportes/resumen')
      .set('Authorization', `Bearer ${org1.accessToken}`)
      .expect(403);
    await request(app)
      .get('/api/auditoria')
      .set('Authorization', `Bearer ${org1.accessToken}`)
      .expect(403);

    // Participante recibe 403
    await request(app)
      .get(`/api/reportes/rifas/${rifa2Id}`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(403);

    // Admin ve reporte de causas y resumen
    const repCausas = await request(app)
      .get('/api/reportes/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(repCausas.body.items[0].recaudadoConfirmado).toBe('50.00');
    expect(repCausas.body.items[0].entregado).toBe('0.00');
    expect(repCausas.body.items[0].porcentajeAvance).toBe(5);
    expect(repCausas.body.items[0].rifasCount).toBe(2);

    const resumen = await request(app)
      .get('/api/reportes/resumen')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(resumen.body.rifasPorEstado.ACTIVA).toBe(2);
    expect(resumen.body.ticketsVendidos).toBe(2);
    expect(resumen.body.recaudacionTotalConfirmada).toBe('50.00');
    expect(resumen.body.recaudacionTotalPendiente).toBe('50.00');

    // Auditoría paginada y filtrada por entidad
    const aud = await request(app)
      .get('/api/auditoria?entidad=pago&page=1&limit=10')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(aud.body.items.length).toBe(2);
    expect(aud.body.items.every((a) => a.entidad === 'pago')).toBe(true);
  });

  it('Criterio de rendimiento (RNF-06): con 10.000 tickets cada reporte responde en menos de 3 segundos', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_perf',
      email: 'orgperf@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Perf',
      password: 'Password123'
    });

    const causa = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombre: 'Causa 10k', meta: 50000 })
      .expect(201);

    const inicio = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const sol = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({
        nombre: 'Mega Rifa 10000',
        precioTicket: 10,
        cantidadTickets: 10000,
        fechaInicio: inicio,
        fechaFin: fin,
        causaId: causa.body.causa.causaId
      })
      .expect(201);

    await request(app)
      .patch(`/api/solicitudes/${sol.body.solicitud.rifaSolicitadaId}/estado`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ estado: 'PAGO_CONFIRMADO' })
      .expect(200);

    const aprob = await request(app)
      .post(`/api/solicitudes/${sol.body.solicitud.rifaSolicitadaId}/aprobar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({})
      .expect(200);

    const rifaId = aprob.body.rifa.rifaId;

    const t0 = performance.now();
    const rRifa = await request(app)
      .get(`/api/reportes/rifas/${rifaId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    const msRifa = performance.now() - t0;

    const t1 = performance.now();
    await request(app)
      .get('/api/reportes/causas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    const msCausas = performance.now() - t1;

    const t2 = performance.now();
    await request(app)
      .get('/api/reportes/resumen')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    const msResumen = performance.now() - t2;

    console.log(
      `[RNF-06 10.000 tickets] /reportes/rifas/:id=${msRifa.toFixed(1)}ms | /reportes/causas=${msCausas.toFixed(1)}ms | /reportes/resumen=${msResumen.toFixed(1)}ms`
    );

    expect(rRifa.body.ticketsPorEstado.DISPONIBLE).toBe(10000);
    expect(msRifa).toBeLessThan(3000);
    expect(msCausas).toBeLessThan(3000);
    expect(msResumen).toBeLessThan(3000);
  });
});
