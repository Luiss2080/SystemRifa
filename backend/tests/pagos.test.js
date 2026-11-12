import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';
import { liberarReservasVencidas } from '../src/jobs/liberarReservas.js';

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

async function crearRifaLista({ organizadorToken, adminToken, precioTicket = 25 }) {
  const inicio = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sol = await request(app)
    .post('/api/solicitudes')
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({
      nombre: 'Rifa Pagos Test',
      precioTicket,
      cantidadTickets: 20,
      fechaInicio: inicio,
      fechaFin: fin
    })
    .expect(201);

  const solId = sol.body.solicitud.rifaSolicitadaId;

  await request(app)
    .patch(`/api/solicitudes/${solId}/estado`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ estado: 'PAGO_CONFIRMADO' })
    .expect(200);

  const aprob = await request(app)
    .post(`/api/solicitudes/${solId}/aprobar`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({})
    .expect(200);

  const rifaId = aprob.body.rifa.rifaId;

  await request(app)
    .post(`/api/rifas/${rifaId}/premios`)
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({ nombre: 'Premio Mayor', valor: 1000 })
    .expect(201);

  return rifaId;
}

describe('Módulo de Pagos (Paso 8)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('flujo completo reserva -> pago (ignora monto manipulado) -> confirmación -> VENDIDO y bloquea doble verificación (409)', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_pagos',
      email: 'orgpagos@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Pagos',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_pagos',
      email: 'comppagos@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Pagos',
      password: 'Password123'
    });

    const rifaId = await crearRifaLista({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      precioTicket: 25
    });

    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [1, 2, 3] })
      .expect(201);

    const misTickets = await request(app)
      .get('/api/tickets/mios')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    const ticketIds = misTickets.body.items.map((t) => t.ticketId);

    // Cliente intenta enviar monto: 0.01 -> servidor calcula 25 * 3 = 75.00
    const pagoRes = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({
        rifaId,
        ticketIds,
        metodo: 'QR',
        referencia: 'QR-001122',
        monto: 0.01
      })
      .expect(201);

    expect(pagoRes.body.pago.estado).toBe('PENDIENTE');
    expect(pagoRes.body.pago.monto).toBe('75.00');
    const pagoId = pagoRes.body.pago.pagoId;

    // Admin recibe notificación NUEVO_PAGO
    const adminNotifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(adminNotifs.body.items.map((n) => n.codigo)).toContain('NUEVO_PAGO');

    // Participante no puede verificar pagos (403)
    await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ aprobado: true })
      .expect(403);

    // Admin confirma el pago
    const verif = await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: true })
      .expect(200);

    expect(verif.body.pago.estado).toBe('CONFIRMADO');
    expect(verif.body.pago.tickets.every((t) => t.estado === 'VENDIDO')).toBe(true);

    const ticketsDb = await prisma.ticket.findMany({ where: { pagoId } });
    expect(ticketsDb).toHaveLength(3);
    expect(ticketsDb.every((t) => t.estado === 'VENDIDO' && t.reservadoHasta === null)).toBe(true);

    // Comprador recibe PAGO_CONFIRMADO
    const compNotifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    expect(compNotifs.body.items.map((n) => n.codigo)).toContain('PAGO_CONFIRMADO');

    // Doble verificación -> 409
    await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: true })
      .expect(409);

    // Auditoría registrada
    const audits = await prisma.auditoria.findMany({
      where: { entidad: 'pago', entidadId: pagoId }
    });
    expect(audits).toHaveLength(1);
    expect(audits[0].accion).toBe('CONFIRMAR_PAGO');
  });

  it('el rechazo exige motivo (400), devuelve tickets a DISPONIBLE y notifica PAGO_RECHAZADO', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_rech',
      email: 'orgrech@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Rechazo',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_rech',
      email: 'comprech@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Rechazo',
      password: 'Password123'
    });

    const rifaId = await crearRifaLista({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken
    });

    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [4, 5] })
      .expect(201);

    const misTickets = await request(app)
      .get('/api/tickets/mios')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    const ticketIds = misTickets.body.items.map((t) => t.ticketId);

    const pagoRes = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ rifaId, ticketIds, metodo: 'TRANSFERENCIA', referencia: 'TRF-001' })
      .expect(201);
    const pagoId = pagoRes.body.pago.pagoId;

    // Sin motivo -> 400
    await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: false })
      .expect(400);

    // Con motivo -> RECHAZADO y tickets liberados
    const rech = await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ aprobado: false, motivo: 'Comprobante ilegible' })
      .expect(200);

    expect(rech.body.pago.estado).toBe('RECHAZADO');

    const ticketsDb = await prisma.ticket.findMany({
      where: { ticketId: { in: ticketIds } }
    });
    for (const t of ticketsDb) {
      expect(t.estado).toBe('DISPONIBLE');
      expect(t.usuarioId).toBeNull();
      expect(t.pagoId).toBeNull();
      expect(t.reservadoHasta).toBeNull();
    }

    const notifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    expect(notifs.body.items.map((n) => n.codigo)).toContain('PAGO_RECHAZADO');
  });

  it('impide pagar tickets de otro usuario o vencidos, y el job no libera tickets con pago PENDIENTE', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_prot',
      email: 'orgprot@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Prot',
      password: 'Password123'
    });
    const comp1 = await registrarYLoguear({
      alias: 'comp_uno_p',
      email: 'comp1p@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Uno',
      password: 'Password123'
    });
    const comp2 = await registrarYLoguear({
      alias: 'comp_dos_p',
      email: 'comp2p@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Dos',
      password: 'Password123'
    });

    const rifaId = await crearRifaLista({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken
    });

    // comp1 reserva 8 y 9
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .send({ numeros: [8, 9] })
      .expect(201);

    const tickets1 = await prisma.ticket.findMany({
      where: { rifaId, numeroTicket: { in: [8, 9] } }
    });

    // comp2 intenta pagar los tickets de comp1 -> 409
    await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp2.accessToken}`)
      .send({
        rifaId,
        ticketIds: tickets1.map((t) => t.ticketId),
        metodo: 'QR'
      })
      .expect(409);

    // comp1 registra pago PENDIENTE sobre [8, 9]
    const pago1 = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .send({
        rifaId,
        ticketIds: tickets1.map((t) => t.ticketId),
        metodo: 'QR',
        referencia: 'QR-PEND'
      })
      .expect(201);

    // Simular que pasó el tiempo de reserva
    await prisma.ticket.updateMany({
      where: { rifaId, numeroTicket: { in: [8, 9] } },
      data: { reservadoHasta: new Date(Date.now() - 5 * 60 * 1000) }
    });

    // El job NO debe liberar [8, 9] porque tienen pago PENDIENTE
    const jobRes = await liberarReservasVencidas();
    expect(jobRes.liberados).toBe(0);

    const stillReserved = await prisma.ticket.findMany({
      where: { pagoId: pago1.body.pago.pagoId }
    });
    expect(stillReserved).toHaveLength(2);
    expect(stillReserved.every((t) => t.estado === 'RESERVADO')).toBe(true);

    // comp2 reserva el #10, vence su reserva y luego intenta pagarla -> 409
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp2.accessToken}`)
      .send({ numeros: [10] })
      .expect(201);

    const t10 = await prisma.ticket.findUnique({
      where: { rifaId_numeroTicket: { rifaId, numeroTicket: 10 } }
    });
    await prisma.ticket.update({
      where: { ticketId: t10.ticketId },
      data: { reservadoHasta: new Date(Date.now() - 60 * 1000) }
    });

    await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${comp2.accessToken}`)
      .send({
        rifaId,
        ticketIds: [t10.ticketId],
        metodo: 'EFECTIVO'
      })
      .expect(409);
  });
});

