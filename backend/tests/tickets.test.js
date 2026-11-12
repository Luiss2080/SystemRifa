import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';
import { liberarReservasVencidas } from '../src/jobs/liberarReservas.js';
import { signAccessToken } from '../src/utils/tokens.js';

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

async function crearRifaAprobada({ organizadorToken, adminToken, cantidadTickets = 50, conPremio = true }) {
  const inicio = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sol = await request(app)
    .post('/api/solicitudes')
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({
      nombre: 'Rifa Solidaria Central',
      precioTicket: 20,
      cantidadTickets,
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

  if (conPremio) {
    await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${organizadorToken}`)
      .send({ nombre: 'Canasta Familiar', valor: 500 })
      .expect(201);
  }

  return rifaId;
}

describe('Rifas, Premios, Reservas y Concurrencia (Paso 7)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rifa sin premio no aparece en catálogo ni acepta reservas; al agregar premio aparece y acepta reservas', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_uno',
      email: 'org1@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Uno',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_uno',
      email: 'comp1@ejemplo.com',
      nombres: 'Comprador',
      apellidos: 'Uno',
      password: 'Password123'
    });

    const rifaId = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 20,
      conPremio: false
    });

    // No aparece en catálogo sin premio activo
    const catSinPremio = await request(app).get('/api/rifas').expect(200);
    expect(catSinPremio.body.items).toHaveLength(0);

    // No acepta reservas sin premio activo
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [1, 2] })
      .expect(409);

    // Organizador carga primer premio
    const premio = await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ nombre: 'Bicicleta Eléctrica', valor: 3500 })
      .expect(201);

    // Ahora aparece en el catálogo
    const catConPremio = await request(app).get('/api/rifas').expect(200);
    expect(catConPremio.body.items).toHaveLength(1);
    expect(catConPremio.body.items[0].ticketsDisponibles).toBe(20);

    // Ahora acepta reservas y el mapa público no expone usuarioId
    const resReserva = await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [1, 2, 3] })
      .expect(201);

    expect(resReserva.body.montoTotal).toBe('60.00');

    const mapa = await request(app).get(`/api/rifas/${rifaId}/tickets`).expect(200);
    const t1 = mapa.body.items.find((t) => t.numeroTicket === 1);
    expect(t1.estado).toBe('RESERVADO');
    expect(t1.usuarioId).toBeUndefined();
    expect(t1.pagoId).toBeUndefined();

    // Si el único premio se desactiva, vuelve a salir del catálogo
    await request(app)
      .delete(`/api/premios/${premio.body.premio.premioId}`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .expect(200);

    const catTrasDesactivar = await request(app).get('/api/rifas').expect(200);
    expect(catTrasDesactivar.body.items).toHaveLength(0);
  });

  it('PRUEBA OBLIGATORIA DE CONCURRENCIA (RNF-03): 20 reservas simultáneas del mismo número dejan 1 éxito y 19 respuestas 409', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_conc',
      email: 'orgconc@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Concurrencia',
      password: 'Password123'
    });

    const rifaId = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 30,
      conPremio: true
    });

    // Crear 20 compradores en BD rápidamente para competir simultáneamente por el ticket #7
    const partRole = await prisma.rol.findUnique({ where: { nombre: 'PARTICIPANTE' } });
    const compradores = [];
    for (let i = 1; i <= 20; i++) {
      const user = await prisma.usuario.create({
        data: {
          alias: `conc_u_${i}`,
          email: `conc_${i}@ejemplo.com`,
          nombres: 'User',
          apellidos: `Conc ${i}`,
          passwordHash: 'hash_no_usado_login',
          roles: {
            create: { rolId: partRole.rolId }
          }
        }
      });
      const token = signAccessToken({ usuarioId: user.usuarioId, roles: ['PARTICIPANTE'] });
      compradores.push({ usuarioId: user.usuarioId, token });
    }

    const respuestas = await Promise.all(
      compradores.map((c) =>
        request(app)
          .post(`/api/rifas/${rifaId}/reservas`)
          .set('Authorization', `Bearer ${c.token}`)
          .send({ numeros: [7] })
      )
    );

    const exitos = respuestas.filter((r) => r.status === 201);
    const conflictos = respuestas.filter((r) => r.status === 409);

    expect(exitos).toHaveLength(1);
    expect(conflictos).toHaveLength(19);

    const ticketGanadorReserva = await prisma.ticket.findUnique({
      where: { rifaId_numeroTicket: { rifaId, numeroTicket: 7 } }
    });
    expect(ticketGanadorReserva.estado).toBe('RESERVADO');
    expect(ticketGanadorReserva.usuarioId).toBeTypeOf('number');
  });

  it('rechaza más de 10 números (400), revierte reserva parcial (409) y bloquea rifa FINALIZADA', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_lim',
      email: 'orglim@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Limites',
      password: 'Password123'
    });
    const comp1 = await registrarYLoguear({
      alias: 'comp_a',
      email: 'compa@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Alfa',
      password: 'Password123'
    });
    const comp2 = await registrarYLoguear({
      alias: 'comp_b',
      email: 'compb@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Beta',
      password: 'Password123'
    });

    const rifaId = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 25,
      conPremio: true
    });

    // Más de 10 números -> 400
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .send({ numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })
      .expect(400);

    // Comp1 reserva el 5
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .send({ numeros: [5] })
      .expect(201);

    // Comp2 intenta reservar [5, 6] -> 409 y el 6 debe seguir DISPONIBLE (atomicidad)
    const conflicto = await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp2.accessToken}`)
      .send({ numeros: [5, 6] })
      .expect(409);
    expect(conflicto.body.error.details.noDisponibles).toEqual([5]);

    const t6 = await prisma.ticket.findUnique({
      where: { rifaId_numeroTicket: { rifaId, numeroTicket: 6 } }
    });
    expect(t6.estado).toBe('DISPONIBLE');

    // Pasar rifa a FINALIZADA rechaza reservas y modificaciones de premios
    await prisma.rifa.update({ where: { rifaId }, data: { estado: 'FINALIZADA' } });

    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp2.accessToken}`)
      .send({ numeros: [6] })
      .expect(409);

    await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ nombre: 'Premio Tardío' })
      .expect(409);
  });

  it('reserva vencida vuelve a DISPONIBLE con el job y notifica RESERVA_VENCIDA', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_job',
      email: 'orgjob@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Job',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_job',
      email: 'compjob@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Job',
      password: 'Password123'
    });

    const rifaId = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 15,
      conPremio: true
    });

    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [3, 4] })
      .expect(201);

    // Simular vencimiento de reserva hace 2 minutos
    await prisma.ticket.updateMany({
      where: { rifaId, numeroTicket: { in: [3, 4] } },
      data: { reservadoHasta: new Date(Date.now() - 2 * 60 * 1000) }
    });

    const jobResult = await liberarReservasVencidas();
    expect(jobResult.liberados).toBe(2);

    const tickets = await prisma.ticket.findMany({
      where: { rifaId, numeroTicket: { in: [3, 4] } }
    });
    for (const t of tickets) {
      expect(t.estado).toBe('DISPONIBLE');
      expect(t.usuarioId).toBeNull();
      expect(t.reservadoHasta).toBeNull();
    }

    const notifs = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    expect(notifs.body.items.map((n) => n.codigo)).toContain('RESERVA_VENCIDA');
  });

  it('un organizador no puede gestionar rifas ajenas (403); el dueño puede extender, anular y liberar reservas', async () => {
    const admin = await loginAdmin();
    const orgDueno = await registrarYLoguear({
      alias: 'org_dueno',
      email: 'dueno@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Dueño',
      password: 'Password123'
    });
    const orgAjeno = await registrarYLoguear({
      alias: 'org_ajeno',
      email: 'ajeno@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Ajeno',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_prop',
      email: 'comprop@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Prop',
      password: 'Password123'
    });

    const rifaId = await crearRifaAprobada({
      organizadorToken: orgDueno.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 15,
      conPremio: true
    });

    // Crear también una rifa para orgAjeno para que tenga el rol ORGANIZADOR
    await crearRifaAprobada({
      organizadorToken: orgAjeno.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 10,
      conPremio: true
    });

    // orgAjeno recibe 403 sobre la rifa de orgDueno
    const nuevaFecha = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await request(app)
      .patch(`/api/rifas/${rifaId}/extender`)
      .set('Authorization', `Bearer ${orgAjeno.accessToken}`)
      .send({ fechaFin: nuevaFecha })
      .expect(403);

    await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${orgAjeno.accessToken}`)
      .send({ nombre: 'Premio Intruso' })
      .expect(403);

    // orgDueno sí puede extender y pasa a EXTENDIDA con auditoría
    const ext = await request(app)
      .patch(`/api/rifas/${rifaId}/extender`)
      .set('Authorization', `Bearer ${orgDueno.accessToken}`)
      .send({ fechaFin: nuevaFecha })
      .expect(200);
    expect(ext.body.rifa.estado).toBe('EXTENDIDA');

    // Mis rifas del dueño
    const mias = await request(app)
      .get('/api/rifas/mias')
      .set('Authorization', `Bearer ${orgDueno.accessToken}`)
      .expect(200);
    expect(mias.body.items).toHaveLength(1);
    expect(mias.body.items[0].rifaId).toBe(rifaId);

    // Comprador reserva y libera
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [1, 2] })
      .expect(201);

    const misTickets = await request(app)
      .get('/api/tickets/mios')
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .expect(200);
    expect(misTickets.body.items).toHaveLength(2);

    await request(app)
      .delete(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp.accessToken}`)
      .send({ numeros: [2] })
      .expect(200);

    // Dueño anula ticket 1 con motivo y audita; ajeno recibe 403
    const ticket1 = misTickets.body.items.find((t) => t.numeroTicket === 1);
    await request(app)
      .post(`/api/tickets/${ticket1.ticketId}/anular`)
      .set('Authorization', `Bearer ${orgAjeno.accessToken}`)
      .send({ motivo: 'Intento ajeno' })
      .expect(403);

    const anulado = await request(app)
      .post(`/api/tickets/${ticket1.ticketId}/anular`)
      .set('Authorization', `Bearer ${orgDueno.accessToken}`)
      .send({ motivo: 'Ticket reservado por error administrativo' })
      .expect(200);
    expect(anulado.body.ticket.estado).toBe('ANULADO');
  });
});

