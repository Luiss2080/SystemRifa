import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureUser({ alias, email, telefono, nombres, apellidos, passwordHash, roles }) {
  let user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.usuario.create({
      data: { alias, email, telefono, nombres, apellidos, passwordHash, activo: true }
    });
  }

  for (const rolNombre of roles) {
    const rol = await prisma.rol.findUnique({ where: { nombre: rolNombre } });
    if (rol) {
      await prisma.rolUsuario.upsert({
        where: { usuarioId_rolId: { usuarioId: user.usuarioId, rolId: rol.rolId } },
        update: {},
        create: { usuarioId: user.usuarioId, rolId: rol.rolId }
      });
    }
  }

  return user;
}

async function main() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'Demo1234!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const [organizador, part1, part2] = await Promise.all([
    ensureUser({
      alias: 'OrgSolidario',
      email: 'organizador@rifas.local',
      telefono: '70100001',
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      passwordHash,
      roles: ['PARTICIPANTE', 'ORGANIZADOR']
    }),
    ensureUser({
      alias: 'AnaParticipante',
      email: 'participante1@rifas.local',
      telefono: '70100002',
      nombres: 'Ana',
      apellidos: 'Rojas',
      passwordHash,
      roles: ['PARTICIPANTE']
    }),
    ensureUser({
      alias: 'LuisSolidario',
      email: 'participante2@rifas.local',
      telefono: '70100003',
      nombres: 'Luis',
      apellidos: 'Pérez',
      passwordHash,
      roles: ['PARTICIPANTE']
    })
  ]);

  const admin = await prisma.usuario.findFirst({
    where: { roles: { some: { rol: { nombre: 'ADMINISTRADOR' } } } }
  });

  // Causas idempotentes
  let causa1 = await prisma.causaSolidaria.findFirst({
    where: { nombre: 'Albergue Patitas Felices' }
  });
  if (!causa1) {
    causa1 = await prisma.causaSolidaria.create({
      data: {
        nombre: 'Albergue Patitas Felices',
        descripcion: 'Recaudación para alimento, vacunas y refugio de animales rescatados.',
        meta: '5000.00'
      }
    });
  }

  let causa2 = await prisma.causaSolidaria.findFirst({
    where: { nombre: 'Comedor Infantil Esperanza' }
  });
  if (!causa2) {
    causa2 = await prisma.causaSolidaria.create({
      data: {
        nombre: 'Comedor Infantil Esperanza',
        descripcion: 'Apoyo nutricional y útiles escolares para niños en situación vulnerable.',
        meta: '8000.00'
      }
    });
  }

  const ahora = Date.now();

  // Rifa 1 Activa
  let rifaActiva1 = await prisma.rifa.findFirst({
    where: { nombre: 'Gran Rifa Pro Albergue' }
  });
  if (!rifaActiva1) {
    rifaActiva1 = await prisma.rifa.create({
      data: {
        usuarioCreadorId: organizador.usuarioId,
        causaId: causa1.causaId,
        nombre: 'Gran Rifa Pro Albergue',
        descripcion: 'Rifa solidaria con excelentes premios tecnológicos y canastas familiares.',
        precioTicket: '20.00',
        cantidadTickets: 100,
        fechaInicio: new Date(ahora - 24 * 60 * 60 * 1000),
        fechaFin: new Date(ahora + 14 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA'
      }
    });

    await prisma.premio.createMany({
      data: [
        {
          rifaId: rifaActiva1.rifaId,
          nombre: 'Bicicleta Montañera Aro 29',
          descripcion: 'Cuadro de aluminio y frenos de disco.',
          valor: '2200.00',
          activo: true
        },
        {
          rifaId: rifaActiva1.rifaId,
          nombre: 'Canasta Solidaria Familiar',
          descripcion: 'Productos de primera necesidad.',
          valor: '450.00',
          activo: true
        }
      ]
    });

    const ticketsData = Array.from({ length: 100 }, (_, i) => ({
      rifaId: rifaActiva1.rifaId,
      numeroTicket: i + 1,
      estado: 'DISPONIBLE'
    }));
    await prisma.ticket.createMany({ data: ticketsData });

    // Pago confirmado demo de participante 1 por tickets 5 y 10
    const pagoDemo = await prisma.pago.create({
      data: {
        rifaId: rifaActiva1.rifaId,
        usuarioId: part1.usuarioId,
        verificadoPorId: admin?.usuarioId ?? null,
        monto: '40.00',
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'DEMO-QR-1001',
        estado: 'CONFIRMADO'
      }
    });

    await prisma.ticket.updateMany({
      where: { rifaId: rifaActiva1.rifaId, numeroTicket: { in: [5, 10] } },
      data: { estado: 'VENDIDO', usuarioId: part1.usuarioId, pagoId: pagoDemo.pagoId }
    });
  }

  // Rifa 2 Activa
  let rifaActiva2 = await prisma.rifa.findFirst({
    where: { nombre: 'Rifa Tecnológica Esperanza' }
  });
  if (!rifaActiva2) {
    rifaActiva2 = await prisma.rifa.create({
      data: {
        usuarioCreadorId: organizador.usuarioId,
        causaId: causa2.causaId,
        nombre: 'Rifa Tecnológica Esperanza',
        descripcion: 'Apoya el comedor escolar participando por una tablet de última generación.',
        precioTicket: '15.00',
        cantidadTickets: 50,
        fechaInicio: new Date(ahora - 12 * 60 * 60 * 1000),
        fechaFin: new Date(ahora + 10 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA'
      }
    });

    await prisma.premio.create({
      data: {
        rifaId: rifaActiva2.rifaId,
        nombre: 'Tablet 11 pulgadas 128GB',
        descripcion: 'Incluye funda protectora.',
        valor: '1800.00',
        activo: true
      }
    });

    await prisma.ticket.createMany({
      data: Array.from({ length: 50 }, (_, i) => ({
        rifaId: rifaActiva2.rifaId,
        numeroTicket: i + 1,
        estado: 'DISPONIBLE'
      }))
    });
  }

  // Rifa 3 Finalizada con sorteo
  const rifaFinalizadaExistente = await prisma.rifa.findFirst({
    where: { nombre: 'Rifa Inaugural Solidaria (Finalizada)' }
  });
  if (!rifaFinalizadaExistente) {
    const rifaFin = await prisma.rifa.create({
      data: {
        usuarioCreadorId: organizador.usuarioId,
        causaId: causa1.causaId,
        nombre: 'Rifa Inaugural Solidaria (Finalizada)',
        descripcion: 'Edición cerrada con ganador oficial verificado.',
        precioTicket: '10.00',
        cantidadTickets: 20,
        fechaInicio: new Date(ahora - 10 * 24 * 60 * 60 * 1000),
        fechaFin: new Date(ahora - 1 * 24 * 60 * 60 * 1000),
        estado: 'FINALIZADA'
      }
    });

    await prisma.ticket.createMany({
      data: Array.from({ length: 20 }, (_, i) => ({
        rifaId: rifaFin.rifaId,
        numeroTicket: i + 1,
        estado: 'DISPONIBLE'
      }))
    });

    const pagoFin = await prisma.pago.create({
      data: {
        rifaId: rifaFin.rifaId,
        usuarioId: part2.usuarioId,
        verificadoPorId: admin?.usuarioId ?? null,
        monto: '30.00',
        metodo: 'EFECTIVO',
        referencia: 'DEMO-EF-900',
        estado: 'CONFIRMADO'
      }
    });

    await prisma.ticket.updateMany({
      where: { rifaId: rifaFin.rifaId, numeroTicket: { in: [3, 7, 14] } },
      data: { estado: 'VENDIDO', usuarioId: part2.usuarioId, pagoId: pagoFin.pagoId }
    });

    const ticketGanador = await prisma.ticket.findFirst({
      where: { rifaId: rifaFin.rifaId, numeroTicket: 7 }
    });

    await prisma.premio.create({
      data: {
        rifaId: rifaFin.rifaId,
        ticketGanadorId: ticketGanador.ticketId,
        nombre: 'Cafetera Espresso Automática',
        descripcion: 'Entregada al ganador.',
        valor: '950.00',
        activo: true,
        reclamado: true,
        datosEntrega: 'Entregado en oficina central'
      }
    });

    await prisma.sorteo.create({
      data: {
        rifaId: rifaFin.rifaId,
        ticketGanadorId: ticketGanador.ticketId,
        realizadoPorId: organizador.usuarioId,
        observacion: 'Sorteo de demostración completado'
      }
    });
  }

  console.log('Seed demo ejecutado correctamente.');
}

main()
  .catch((err) => {
    console.error('Error ejecutando seed demo:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

