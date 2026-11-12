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

async function crearRifaAprobada({ organizadorToken, adminToken, cantidadTickets = 10, premios = [] }) {
  const inicio = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sol = await request(app)
    .post('/api/solicitudes')
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({
      nombre: 'Rifa Sorteo Test',
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

  const premiosCreados = [];
  for (const p of premios) {
    const resP = await request(app)
      .post(`/api/rifas/${rifaId}/premios`)
      .set('Authorization', `Bearer ${organizadorToken}`)
      .send(p)
      .expect(201);
    premiosCreados.push(resP.body.premio);
  }

  return { rifaId, premiosCreados };
}

async function venderNumeros({ rifaId, compradorToken, adminToken, numeros }) {
  await request(app)
    .post(`/api/rifas/${rifaId}/reservas`)
    .set('Authorization', `Bearer ${compradorToken}`)
    .send({ numeros })
    .expect(201);

  const tickets = await prisma.ticket.findMany({
    where: { rifaId, numeroTicket: { in: numeros } }
  });

  const pago = await request(app)
    .post('/api/pagos')
    .set('Authorization', `Bearer ${compradorToken}`)
    .send({
      rifaId,
      ticketIds: tickets.map((t) => t.ticketId),
      metodo: 'QR',
      referencia: `REF-${numeros.join('-')}`
    })
    .expect(201);

  await request(app)
    .patch(`/api/pagos/${pago.body.pago.pagoId}/verificar`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ aprobado: true })
    .expect(200);

  return tickets;
}

describe('Sorteo, Resultado Público y Entrega de Premios (Paso 9)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rechaza sorteo sin premios o sin ventas (409) y antes de fechaFin sin forzar (409); finalizar sin ventas funciona', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_s1',
      email: 'orgs1@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Uno',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_s1',
      email: 'comps1@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Uno',
      password: 'Password123'
    });

    // Rifa sin premios
    const { rifaId: rifaSinPremios } = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      premios: []
    });

    await request(app)
      .post(`/api/rifas/${rifaSinPremios}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({})
      .expect(409);

    // Finalizar sin ventas sí funciona
    const finSinVentas = await request(app)
      .post(`/api/rifas/${rifaSinPremios}/finalizar`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ motivo: 'No hubo interesados' })
      .expect(200);
    expect(finSinVentas.body.estado).toBe('FINALIZADA');

    // Rifa con premio pero sin ventas -> sorteo 409
    const { rifaId } = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      premios: [{ nombre: 'Televisor', valor: 2500 }]
    });

    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({})
      .expect(409);

    // Vender 1 ticket -> ahora si intenta finalizar sin sorteo -> 409
    await venderNumeros({
      rifaId,
      compradorToken: comp.accessToken,
      adminToken: admin.accessToken,
      numeros: [1]
    });

    await request(app)
      .post(`/api/rifas/${rifaId}/finalizar`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ motivo: 'Intento indebido' })
      .expect(409);

    // Antes de fechaFin sin forzar -> 409; organizador forzando -> 403
    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({})
      .expect(409);

    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ forzar: true, observacion: 'Org no puede forzar' })
      .expect(403);
  });

  it('sortea solo entre VENDIDOS, no repite tickets entre varios premios, notifica, oculta PII en resultado y permite entrega', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_s2',
      email: 'orgs2@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Dos',
      password: 'Password123'
    });
    const orgAjeno = await registrarYLoguear({
      alias: 'org_ajeno_s',
      email: 'orgajenos@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Ajeno',
      password: 'Password123'
    });
    const comp1 = await registrarYLoguear({
      alias: 'ganador_uno',
      email: 'secreto1@ejemplo.com',
      telefono: '77700011',
      nombres: 'Carlos Alberto',
      apellidos: 'Vega Méndez',
      password: 'Password123'
    });
    const comp2 = await registrarYLoguear({
      alias: 'ganador_dos',
      email: 'secreto2@ejemplo.com',
      telefono: '77700022',
      nombres: 'Lucía',
      apellidos: 'Quispe',
      password: 'Password123'
    });

    // Rifa para orgAjeno (para que tenga rol ORGANIZADOR)
    await crearRifaAprobada({
      organizadorToken: orgAjeno.accessToken,
      adminToken: admin.accessToken,
      premios: [{ nombre: 'Premio Ajeno' }]
    });

    const { rifaId, premiosCreados } = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      cantidadTickets: 10,
      premios: [
        { nombre: '1er Premio: Laptop', valor: 4000 },
        { nombre: '2do Premio: Celular', valor: 1500 },
        { nombre: '3er Premio: Audífonos', valor: 300 }
      ]
    });

    // Vender 2 tickets (#1 a comp1, #2 a comp2) -> hay 3 premios y solo 2 vendidos
    await venderNumeros({
      rifaId,
      compradorToken: comp1.accessToken,
      adminToken: admin.accessToken,
      numeros: [1]
    });
    await venderNumeros({
      rifaId,
      compradorToken: comp2.accessToken,
      adminToken: admin.accessToken,
      numeros: [2]
    });

    // Dejar #3 RESERVADO y #4 ANULADO -> nunca deben ganar
    await request(app)
      .post(`/api/rifas/${rifaId}/reservas`)
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .send({ numeros: [3] })
      .expect(201);

    const t4 = await prisma.ticket.findUnique({
      where: { rifaId_numeroTicket: { rifaId, numeroTicket: 4 } }
    });
    await request(app)
      .post(`/api/tickets/${t4.ticketId}/anular`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ motivo: 'Anulado antes del sorteo' })
      .expect(200);

    // Simular que ya pasó fechaFin
    await prisma.rifa.update({
      where: { rifaId },
      data: { fechaFin: new Date(Date.now() - 60 * 1000) }
    });

    // Organizador ajeno recibe 403
    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${orgAjeno.accessToken}`)
      .send({})
      .expect(403);

    // Organizador dueño realiza sorteo
    const sorteoRes = await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({})
      .expect(200);

    expect(sorteoRes.body.estadoRifa).toBe('FINALIZADA');
    expect(sorteoRes.body.ganadores).toHaveLength(2);
    const numsGanadores = sorteoRes.body.ganadores.map((g) => g.numeroTicket);
    expect(new Set(numsGanadores).size).toBe(2);
    expect(numsGanadores.every((n) => n === 1 || n === 2)).toBe(true);
    expect(sorteoRes.body.sorteo.observacion).toContain('sin repetir ticket');

    // Sorteo duplicado -> 409
    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({})
      .expect(409);

    // Resultado público sin datos personales (email ni teléfono)
    const resPub = await request(app).get(`/api/rifas/${rifaId}/resultado`).expect(200);
    const bodyStr = JSON.stringify(resPub.body);
    expect(bodyStr).not.toContain('secreto1@ejemplo.com');
    expect(bodyStr).not.toContain('secreto2@ejemplo.com');
    expect(bodyStr).not.toContain('77700011');
    expect(bodyStr).not.toContain('77700022');
    expect(resPub.body.sorteo.ganadorPrincipal.alias).toBeTypeOf('string');
    expect(resPub.body.sorteo.ganadorPrincipal.iniciales).toBeTypeOf('string');

    // Notificaciones SORTEO_REALIZADO y GANADOR enviadas
    const notifs1 = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${comp1.accessToken}`)
      .expect(200);
    const codes1 = notifs1.body.items.map((n) => n.codigo);
    expect(codes1).toContain('SORTEO_REALIZADO');
    expect(codes1).toContain('GANADOR');

    // Registrar entrega en premio ganador y rechazar en premio sin ganador
    const premioGanado = premiosCreados[0];
    const entrega = await request(app)
      .patch(`/api/premios/${premioGanado.premioId}/entrega`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ reclamado: true, datosEntrega: 'Entregado con CI firmado' })
      .expect(200);
    expect(entrega.body.premio.reclamado).toBe(true);

    const premioSinGanador = premiosCreados[2];
    await request(app)
      .patch(`/api/premios/${premioSinGanador.premioId}/entrega`)
      .set('Authorization', `Bearer ${org.accessToken}`)
      .send({ reclamado: true })
      .expect(409);
  });

  it('el administrador puede forzar el sorteo antes de fechaFin con observación obligatoria', async () => {
    const admin = await loginAdmin();
    const org = await registrarYLoguear({
      alias: 'org_forzar',
      email: 'orgforzar@ejemplo.com',
      nombres: 'Org',
      apellidos: 'Forzar',
      password: 'Password123'
    });
    const comp = await registrarYLoguear({
      alias: 'comp_forzar',
      email: 'compforzar@ejemplo.com',
      nombres: 'Comp',
      apellidos: 'Forzar',
      password: 'Password123'
    });

    const { rifaId } = await crearRifaAprobada({
      organizadorToken: org.accessToken,
      adminToken: admin.accessToken,
      premios: [{ nombre: 'Premio Único' }]
    });

    await venderNumeros({
      rifaId,
      compradorToken: comp.accessToken,
      adminToken: admin.accessToken,
      numeros: [5]
    });

    // Sin observación -> 400
    await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ forzar: true })
      .expect(400);

    // Con observación -> 200
    const res = await request(app)
      .post(`/api/rifas/${rifaId}/sorteo`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ forzar: true, observacion: 'Cierre adelantado autorizado por coordinación' })
      .expect(200);

    expect(res.body.estadoRifa).toBe('FINALIZADA');
    expect(res.body.ganadores[0].numeroTicket).toBe(5);
  });
});

