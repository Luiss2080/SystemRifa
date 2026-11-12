import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';

describe('Flujo End-to-End Completo (Paso 14)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('cubre registro -> solicitud -> aprobación -> premios -> reserva -> pago -> verificación -> sorteo -> resultado sin PII -> entrega -> reportes y auditoría', async () => {
    // 1. Login admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
      .expect(200);
    const adminToken = adminLogin.body.accessToken;

    // 2. Registro de organizador y participante
    await request(app)
      .post('/api/auth/registro')
      .send({
        alias: 'OrgE2E',
        email: 'org.e2e@test.com',
        nombres: 'Elena',
        apellidos: 'Torrez',
        password: 'Password123'
      })
      .expect(201);

    await request(app)
      .post('/api/auth/registro')
      .send({
        alias: 'PartE2E',
        email: 'part.e2e@test.com',
        telefono: '77788899',
        nombres: 'Mario',
        apellidos: 'Vargas',
        password: 'Password123'
      })
      .expect(201);

    const orgLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'org.e2e@test.com', password: 'Password123' })
      .expect(200);
    const orgToken = orgLogin.body.accessToken;

    const partLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'part.e2e@test.com', password: 'Password123' })
      .expect(200);
    const partToken = partLogin.body.accessToken;

    // 3. Admin crea causa solidaria
    const causaRes = await request(app)
      .post('/api/causas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Causa E2E Hospital',
        descripcion: 'Equipamiento médico solidario',
        meta: 3000
      })
      .expect(201);
    const causaId = causaRes.body.causa.causaId;

    // 4. Organizador envía solicitud
    const ahora = Date.now();
    const solRes = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        nombre: 'Rifa E2E Solidaria',
        descripcion: 'Rifa completa de prueba',
        precioTicket: 25,
        cantidadTickets: 20,
        fechaInicio: new Date(ahora - 60 * 1000).toISOString(),
        fechaFin: new Date(ahora + 72 * 60 * 60 * 1000).toISOString(),
        causaId
      })
      .expect(201);
    const solId = solRes.body.solicitud.rifaSolicitadaId;

    // 5. Admin revisa y aprueba solicitud (respeta TARIFA_PUBLICACION)
    if (Number(process.env.TARIFA_PUBLICACION ?? 0) > 0) {
      await request(app)
        .patch(`/api/solicitudes/${solId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'ESPERANDO_PAGO' })
        .expect(200);

      await request(app)
        .patch(`/api/solicitudes/${solId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'PAGO_CONFIRMADO', referenciaPago: 'TARIFA-E2E-1' })
        .expect(200);
    } else {
      await request(app)
        .patch(`/api/solicitudes/${solId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'PAGO_CONFIRMADO' })
        .expect(200);
    }

    const aprobRes = await request(app)
      .post(`/api/solicitudes/${solId}/aprobar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ observacion: 'Aprobada en E2E' })
      .expect(201);
    const rifaId = aprobRes.body.rifa.rifaId;

    // 6. Organizador agrega 2 premios
    const p1Res = await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({ nombre: 'Premio E2E 1', descripcion: 'Principal', valor: 1000 })
      .expect(201);
    const premio1Id = p1Res.body.premio.premioId;

    await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({ nombre: 'Premio E2E 2', descripcion: 'Secundario', valor: 400 })
      .expect(201);

    // 7. Participante consulta catálogo público y reserva tickets
    const catRes = await request(app).get('/api/rifas').expect(200);
    expect(catRes.body.items.some((r) => r.rifaId === rifaId)).toBe(true);

    const reservaRes = await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${partToken}`)
      .send({ numeros: [4, 8, 12] })
      .expect(200);
    expect(reservaRes.body.montoTotal).toBe('75.00');

    const misTicketsRes = await request(app)
      .get('/api/tickets/mios')
      .set('Authorization', `Bearer ${partToken}`)
      .expect(200);
    const ticketIds = misTicketsRes.body.items
      .filter((t) => t.rifaId === rifaId && t.estado === 'RESERVADO')
      .map((t) => t.ticketId);
    expect(ticketIds).toHaveLength(3);

    // 8. Participante registra pago y Admin lo confirma
    const pagoRes = await request(app)
      .post('/api/pagos')
      .set('Authorization', `Bearer ${partToken}`)
      .send({
        rifaId,
        ticketIds,
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-E2E-777'
      })
      .expect(201);
    const pagoId = pagoRes.body.pago.pagoId;

    await request(app)
      .patch(`/api/pagos/${pagoId}/verificar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ aprobado: true })
      .expect(200);

    // 9. Admin realiza el sorteo (forzado antes de fechaFin con observación obligatoria)
    const sorteoRes = await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ forzar: true, observacion: 'Cierre anticipado E2E' })
      .expect(200);

    expect(sorteoRes.body.estadoRifa).toBe('FINALIZADA');
    expect(sorteoRes.body.ganadores).toHaveLength(2);
    const numsGanadores = sorteoRes.body.ganadores.map((g) => g.numeroTicket);
    expect(new Set(numsGanadores).size).toBe(2);
    for (const num of numsGanadores) {
      expect([4, 8, 12]).toContain(num);
    }

    // 10. Resultado público sin PII
    const resultadoRes = await request(app).get(`/api/rifas/${rifaId}/resultado`).expect(200);
    expect(resultadoRes.body.sorteo.ganadorPrincipal.alias).toBe('PartE2E');
    expect(resultadoRes.body.sorteo.ganadorPrincipal.iniciales).toBe('M. V.');
    const rawJson = JSON.stringify(resultadoRes.body);
    expect(rawJson).not.toContain('part.e2e@test.com');
    expect(rawJson).not.toContain('77788899');
    expect(rawJson).not.toContain('Mario');
    expect(rawJson).not.toContain('Vargas');

    // 11. Organizador registra entrega del premio 1
    await request(app)
      .patch(`/api/premios/${premio1Id}/entrega`)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({ reclamado: true, datosEntrega: 'Entregado con acta E2E' })
      .expect(200);

    // 12. Reportes y auditoría
    const repRifa = await request(app)
      .get(`/api/reportes/rifas/${rifaId}`)
      .set('Authorization', `Bearer ${orgToken}`)
      .expect(200);
    expect(repRifa.body.recaudacionConfirmada).toBe('75.00');
    expect(repRifa.body.ticketsPorEstado.VENDIDO).toBe(3);

    const repCausas = await request(app)
      .get('/api/reportes/causas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const causaRep = repCausas.body.items.find((c) => c.causaId === causaId);
    expect(causaRep.recaudadoConfirmado).toBe('75.00');

    const auditRes = await request(app)
      .get('/api/auditoria')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(auditRes.body.items.some((a) => a.accion === 'REALIZAR_SORTEO')).toBe(true);
  });
});
