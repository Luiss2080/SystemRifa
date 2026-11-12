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

async function ensureCausa({ nombre, descripcion, meta }) {
  let causa = await prisma.causaSolidaria.findFirst({ where: { nombre } });
  if (!causa) {
    causa = await prisma.causaSolidaria.create({
      data: { nombre, descripcion, meta }
    });
  }
  return causa;
}

async function ensureRifaActiva({
  nombre,
  descripcion,
  creadorId,
  causaId,
  precioTicket,
  cantidadTickets,
  fechaInicio,
  fechaFin,
  estado = 'ACTIVA',
  premios,
  ventas = [],
  reservaPendiente = null
}) {
  const existente = await prisma.rifa.findFirst({ where: { nombre } });
  if (existente) return existente;

  const rifa = await prisma.rifa.create({
    data: {
      usuarioCreadorId: creadorId,
      causaId,
      nombre,
      descripcion,
      precioTicket,
      cantidadTickets,
      fechaInicio,
      fechaFin,
      estado
    }
  });

  if (premios?.length) {
    await prisma.premio.createMany({
      data: premios.map((p) => ({
        rifaId: rifa.rifaId,
        nombre: p.nombre,
        descripcion: p.descripcion,
        valor: p.valor,
        activo: true
      }))
    });
  }

  await prisma.ticket.createMany({
    data: Array.from({ length: cantidadTickets }, (_, i) => ({
      rifaId: rifa.rifaId,
      numeroTicket: i + 1,
      estado: 'DISPONIBLE'
    }))
  });

  for (const venta of ventas) {
    const montoTotal = (Number(precioTicket) * venta.numeros.length).toFixed(2);
    const pago = await prisma.pago.create({
      data: {
        rifaId: rifa.rifaId,
        usuarioId: venta.usuarioId,
        verificadoPorId: venta.verificadoPorId ?? null,
        monto: montoTotal,
        metodo: venta.metodo || 'TRANSFERENCIA_QR',
        referencia: venta.referencia,
        estado: 'CONFIRMADO'
      }
    });

    await prisma.ticket.updateMany({
      where: { rifaId: rifa.rifaId, numeroTicket: { in: venta.numeros } },
      data: { estado: 'VENDIDO', usuarioId: venta.usuarioId, pagoId: pago.pagoId }
    });
  }

  if (reservaPendiente) {
    const montoReserva = (Number(precioTicket) * reservaPendiente.numeros.length).toFixed(2);
    const pagoPend = await prisma.pago.create({
      data: {
        rifaId: rifa.rifaId,
        usuarioId: reservaPendiente.usuarioId,
        monto: montoReserva,
        metodo: reservaPendiente.metodo || 'TRANSFERENCIA_QR',
        referencia: reservaPendiente.referencia,
        estado: 'PENDIENTE'
      }
    });

    await prisma.ticket.updateMany({
      where: { rifaId: rifa.rifaId, numeroTicket: { in: reservaPendiente.numeros } },
      data: {
        estado: 'RESERVADO',
        usuarioId: reservaPendiente.usuarioId,
        pagoId: pagoPend.pagoId,
        reservadoHasta: new Date(Date.now() + 15 * 60 * 1000)
      }
    });
  }

  return rifa;
}

async function main() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'Demo1234!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const [organizador, organizador2, part1, part2, part3, part4] = await Promise.all([
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
      alias: 'LuciaCausa',
      email: 'organizador2@rifas.local',
      telefono: '70100004',
      nombres: 'Lucía',
      apellidos: 'Salvatierra',
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
    }),
    ensureUser({
      alias: 'MariaSolidaria',
      email: 'participante3@rifas.local',
      telefono: '70100005',
      nombres: 'María',
      apellidos: 'Fernández',
      passwordHash,
      roles: ['PARTICIPANTE']
    }),
    ensureUser({
      alias: 'DiegoV',
      email: 'participante4@rifas.local',
      telefono: '70100006',
      nombres: 'Diego',
      apellidos: 'Vargas',
      passwordHash,
      roles: ['PARTICIPANTE']
    })
  ]);

  const admin = await prisma.usuario.findFirst({
    where: { roles: { some: { rol: { nombre: 'ADMINISTRADOR' } } } }
  });
  const adminId = admin?.usuarioId ?? null;

  // 6 Causas Solidarias verificadas
  const [causa1, causa2, causa3, causa4, causa5, causa6] = await Promise.all([
    ensureCausa({
      nombre: 'Albergue Patitas Felices',
      descripcion: 'Recaudación para alimento, vacunas y refugio de animales rescatados.',
      meta: '5000.00'
    }),
    ensureCausa({
      nombre: 'Comedor Infantil Esperanza',
      descripcion: 'Apoyo nutricional y útiles escolares para niños en situación vulnerable.',
      meta: '8000.00'
    }),
    ensureCausa({
      nombre: 'Salud Comunitaria Santa Cruz',
      descripcion:
        'Equipamiento de brigadas médicas móviles, toma de signos y medicamentos esenciales para barrios periurbanos.',
      meta: '15000.00'
    }),
    ensureCausa({
      nombre: 'Becas Tech y Robótica Juvenil',
      descripcion:
        'Kits de robótica educativa, licencias y becas tecnológicas para estudiantes de colegios públicos.',
      meta: '12500.00'
    }),
    ensureCausa({
      nombre: 'Hogar Abuelos del Oriente',
      descripcion:
        'Mejora de habitaciones, alimentación especializada y fisioterapia para adultos mayores.',
      meta: '10000.00'
    }),
    ensureCausa({
      nombre: 'Reforestación Chiquitanía Viva',
      descripcion:
        'Adquisición de plantines nativos, herramientas forestales y jornadas comunitarias de restauración.',
      meta: '9500.00'
    })
  ]);

  const ahora = Date.now();
  const HORA = 60 * 60 * 1000;
  const DIA = 24 * HORA;

  // Rifa 1 Activa (compatibilidad con demo inicial)
  await ensureRifaActiva({
    nombre: 'Gran Rifa Pro Albergue',
    descripcion: 'Rifa solidaria con excelentes premios tecnológicos y canastas familiares.',
    creadorId: organizador.usuarioId,
    causaId: causa1.causaId,
    precioTicket: '20.00',
    cantidadTickets: 100,
    fechaInicio: new Date(ahora - 2 * DIA),
    fechaFin: new Date(ahora + 14 * DIA),
    estado: 'ACTIVA',
    premios: [
      {
        nombre: 'Bicicleta Montañera Aro 29',
        descripcion: 'Cuadro de aluminio y frenos de disco.',
        valor: '2200.00'
      },
      {
        nombre: 'Canasta Solidaria Familiar',
        descripcion: 'Productos de primera necesidad.',
        valor: '450.00'
      }
    ],
    ventas: [
      {
        usuarioId: part1.usuarioId,
        verificadoPorId: adminId,
        numeros: [5, 10],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'DEMO-QR-1001'
      }
    ]
  });

  // Rifa 2 Activa
  await ensureRifaActiva({
    nombre: 'Rifa Tecnológica Esperanza',
    descripcion: 'Apoya el comedor escolar participando por una tablet de última generación.',
    creadorId: organizador.usuarioId,
    causaId: causa2.causaId,
    precioTicket: '15.00',
    cantidadTickets: 50,
    fechaInicio: new Date(ahora - DIA),
    fechaFin: new Date(ahora + 10 * DIA),
    estado: 'ACTIVA',
    premios: [
      {
        nombre: 'Tablet 11 pulgadas 128GB',
        descripcion: 'Incluye funda protectora y lápiz óptico.',
        valor: '1800.00'
      }
    ],
    ventas: [
      {
        usuarioId: part3.usuarioId,
        verificadoPorId: adminId,
        numeros: [2, 8, 15, 22, 31],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'DEMO-QR-1002'
      }
    ]
  });

  // Rifa 3 Activa (Cierra pronto <= 48h)
  await ensureRifaActiva({
    nombre: 'Kit Médico y Hogar Pro-Salud',
    descripcion:
      'Últimas horas para sumarte a las brigadas médicas móviles en barrios de Santa Cruz y ganar premios para tu hogar.',
    creadorId: organizador2.usuarioId,
    causaId: causa3.causaId,
    precioTicket: '25.00',
    cantidadTickets: 80,
    fechaInicio: new Date(ahora - 5 * DIA),
    fechaFin: new Date(ahora + 18 * HORA),
    estado: 'ACTIVA',
    premios: [
      {
        nombre: 'Smart TV 50" 4K UHD',
        descripcion: 'Resolución Ultra HD con control por voz y garantía local.',
        valor: '3400.00'
      },
      {
        nombre: 'Freidora de Aire Digital 6L',
        descripcion: 'Panel táctil con 8 programas automáticos.',
        valor: '650.00'
      },
      {
        nombre: 'Kit Primeros Auxilios Familiar',
        descripcion: 'Incluye tensiómetro digital y oxímetro.',
        valor: '280.00'
      }
    ],
    ventas: [
      {
        usuarioId: part1.usuarioId,
        verificadoPorId: adminId,
        numeros: [1, 4, 7, 12, 19, 25, 33, 40],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-SALUD-301'
      },
      {
        usuarioId: part2.usuarioId,
        verificadoPorId: adminId,
        numeros: [3, 9, 14, 21, 28, 36, 44, 52, 60, 68],
        metodo: 'TRANSFERENCIA_BANCARIA',
        referencia: 'BCO-SALUD-302'
      },
      {
        usuarioId: part3.usuarioId,
        verificadoPorId: adminId,
        numeros: [6, 11, 18, 24, 30, 41, 49, 55, 63, 72],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-SALUD-303'
      }
    ],
    reservaPendiente: {
      usuarioId: part4.usuarioId,
      numeros: [15, 16, 17],
      metodo: 'TRANSFERENCIA_QR',
      referencia: 'QR-PEND-304'
    }
  });

  // Rifa 4 Activa (Cierra pronto <= 48h)
  await ensureRifaActiva({
    nombre: 'Rifa Gamer y Robótica Educativa',
    descripcion:
      'Impulsa talleres gratuitos de programación y robótica escolar participando por equipamiento gamer.',
    creadorId: organizador.usuarioId,
    causaId: causa4.causaId,
    precioTicket: '15.00',
    cantidadTickets: 100,
    fechaInicio: new Date(ahora - 4 * DIA),
    fechaFin: new Date(ahora + 36 * HORA),
    estado: 'ACTIVA',
    premios: [
      {
        nombre: 'Consola Portátil OLED 128GB',
        descripcion: 'Edición especial con estuche rígido y juego incluido.',
        valor: '2600.00'
      },
      {
        nombre: 'Audífonos Inalámbricos Studio',
        descripcion: 'Cancelación activa de ruido y estuche de carga.',
        valor: '520.00'
      }
    ],
    ventas: [
      {
        usuarioId: part4.usuarioId,
        verificadoPorId: adminId,
        numeros: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-TECH-401'
      },
      {
        usuarioId: part3.usuarioId,
        verificadoPorId: adminId,
        numeros: [13, 17, 23, 27, 33, 37, 43, 47, 53, 57, 63, 67],
        metodo: 'TRANSFERENCIA_BANCARIA',
        referencia: 'BCO-TECH-402'
      }
    ]
  });

  // Rifa 5 Extendida
  await ensureRifaActiva({
    nombre: 'Gran Campaña Hogar Abuelos del Oriente',
    descripcion:
      'Ayúdanos a renovar camas ortopédicas y sesiones de fisioterapia para 38 adultos mayores.',
    creadorId: organizador2.usuarioId,
    causaId: causa5.causaId,
    precioTicket: '30.00',
    cantidadTickets: 60,
    fechaInicio: new Date(ahora - 3 * DIA),
    fechaFin: new Date(ahora + 6 * DIA),
    estado: 'EXTENDIDA',
    premios: [
      {
        nombre: 'Laptop Ultrabook 16GB RAM / 512GB SSD',
        descripcion: 'Procesador de última generación, pantalla Full HD 14".',
        valor: '4800.00'
      },
      {
        nombre: 'Cafetera Italiana + Set Gourmet',
        descripcion: 'Incluye molinillo manual y 1kg de café de especialidad.',
        valor: '780.00'
      }
    ],
    ventas: [
      {
        usuarioId: part1.usuarioId,
        verificadoPorId: adminId,
        numeros: [2, 5, 8, 11, 14, 17, 20, 23],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-ABUELOS-501'
      },
      {
        usuarioId: part2.usuarioId,
        verificadoPorId: adminId,
        numeros: [4, 9, 12, 16, 21, 27, 34, 42],
        metodo: 'EFECTIVO',
        referencia: 'EF-ABUELOS-502'
      }
    ]
  });

  // Rifa 6 Activa
  await ensureRifaActiva({
    nombre: 'Eco-Rifa Chiquitanía Viva',
    descripcion:
      'Cada ticket financia plantines nativos y equipamiento comunitario para brigadas de reforestación.',
    creadorId: organizador2.usuarioId,
    causaId: causa6.causaId,
    precioTicket: '10.00',
    cantidadTickets: 100,
    fechaInicio: new Date(ahora - DIA),
    fechaFin: new Date(ahora + 11 * DIA),
    estado: 'ACTIVA',
    premios: [
      {
        nombre: 'Smartphone 5G 256GB',
        descripcion: 'Doble SIM liberado, cámara triple 50MP y cargador rápido.',
        valor: '2400.00'
      },
      {
        nombre: 'Parlante Bluetooth Outdoor IP67',
        descripcion: 'Resistente al agua y polvo con 20h de batería.',
        valor: '490.00'
      }
    ],
    ventas: [
      {
        usuarioId: part4.usuarioId,
        verificadoPorId: adminId,
        numeros: [7, 14, 21, 28, 35, 42, 49],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-ECO-601'
      },
      {
        usuarioId: part3.usuarioId,
        verificadoPorId: adminId,
        numeros: [3, 18, 29, 45, 58, 76, 84, 92],
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-ECO-602'
      }
    ]
  });

  // Rifa Finalizada 1 (compatibilidad demo inicial)
  const rifaFinalizada1 = await prisma.rifa.findFirst({
    where: { nombre: 'Rifa Inaugural Solidaria (Finalizada)' }
  });
  if (!rifaFinalizada1) {
    const rifaFin = await prisma.rifa.create({
      data: {
        usuarioCreadorId: organizador.usuarioId,
        causaId: causa1.causaId,
        nombre: 'Rifa Inaugural Solidaria (Finalizada)',
        descripcion: 'Edición cerrada con ganador oficial verificado.',
        precioTicket: '10.00',
        cantidadTickets: 20,
        fechaInicio: new Date(ahora - 10 * DIA),
        fechaFin: new Date(ahora - DIA),
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
        verificadoPorId: adminId,
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

  // Rifa Finalizada 2 con múltiples ganadores y auditoría
  const rifaFinalizada2 = await prisma.rifa.findFirst({
    where: { nombre: 'Rifa Solidaria Educación Digital 2026' }
  });
  if (!rifaFinalizada2) {
    const rifaFin2 = await prisma.rifa.create({
      data: {
        usuarioCreadorId: organizador2.usuarioId,
        causaId: causa4.causaId,
        nombre: 'Rifa Solidaria Educación Digital 2026',
        descripcion: 'Primera edición para financiar kits Arduino en unidades educativas.',
        precioTicket: '20.00',
        cantidadTickets: 40,
        fechaInicio: new Date(ahora - 16 * DIA),
        fechaFin: new Date(ahora - 3 * DIA),
        estado: 'FINALIZADA'
      }
    });

    await prisma.ticket.createMany({
      data: Array.from({ length: 40 }, (_, i) => ({
        rifaId: rifaFin2.rifaId,
        numeroTicket: i + 1,
        estado: 'DISPONIBLE'
      }))
    });

    const pagoA = await prisma.pago.create({
      data: {
        rifaId: rifaFin2.rifaId,
        usuarioId: part3.usuarioId,
        verificadoPorId: adminId,
        monto: '100.00',
        metodo: 'TRANSFERENCIA_QR',
        referencia: 'QR-EDU-801',
        estado: 'CONFIRMADO'
      }
    });
    await prisma.ticket.updateMany({
      where: { rifaId: rifaFin2.rifaId, numeroTicket: { in: [5, 12, 18, 25, 32] } },
      data: { estado: 'VENDIDO', usuarioId: part3.usuarioId, pagoId: pagoA.pagoId }
    });

    const pagoB = await prisma.pago.create({
      data: {
        rifaId: rifaFin2.rifaId,
        usuarioId: part4.usuarioId,
        verificadoPorId: adminId,
        monto: '80.00',
        metodo: 'TRANSFERENCIA_BANCARIA',
        referencia: 'BCO-EDU-802',
        estado: 'CONFIRMADO'
      }
    });
    await prisma.ticket.updateMany({
      where: { rifaId: rifaFin2.rifaId, numeroTicket: { in: [9, 14, 29, 36] } },
      data: { estado: 'VENDIDO', usuarioId: part4.usuarioId, pagoId: pagoB.pagoId }
    });

    const [tGanador1, tGanador2] = await Promise.all([
      prisma.ticket.findFirst({ where: { rifaId: rifaFin2.rifaId, numeroTicket: 18 } }),
      prisma.ticket.findFirst({ where: { rifaId: rifaFin2.rifaId, numeroTicket: 29 } })
    ]);

    await prisma.premio.create({
      data: {
        rifaId: rifaFin2.rifaId,
        ticketGanadorId: tGanador1.ticketId,
        nombre: 'Monitor Curvo 27" 144Hz',
        descripcion: 'Entregado con acta firmada.',
        valor: '2100.00',
        activo: true,
        reclamado: true,
        datosEntrega: 'Entregado a MariaSolidaria en Santa Cruz'
      }
    });

    await prisma.premio.create({
      data: {
        rifaId: rifaFin2.rifaId,
        ticketGanadorId: tGanador2.ticketId,
        nombre: 'Teclado Mecánico RGB + Mouse',
        descripcion: 'Set periféricos gamer.',
        valor: '580.00',
        activo: true,
        reclamado: false
      }
    });

    await prisma.sorteo.create({
      data: {
        rifaId: rifaFin2.rifaId,
        ticketGanadorId: tGanador1.ticketId,
        realizadoPorId: organizador2.usuarioId,
        fecha: new Date(ahora - 2 * DIA),
        observacion: 'Sorteo público auditado sin incidencias'
      }
    });
  }

  // Solicitudes de ejemplo para el panel de revisión
  const solExistente = await prisma.rifaSolicitada.findFirst({
    where: { nombre: 'Rifa Solidaria Equipamiento Pediátrico' }
  });
  if (!solExistente) {
    await prisma.rifaSolicitada.createMany({
      data: [
        {
          usuarioId: part1.usuarioId,
          causaId: causa3.causaId,
          nombre: 'Rifa Solidaria Equipamiento Pediátrico',
          descripcion: 'Campaña vecinal para compra de nebulizadores e insumos médicos.',
          precioTicket: '20.00',
          cantidadTickets: 100,
          fechaInicio: new Date(ahora + 2 * DIA),
          fechaFin: new Date(ahora + 20 * DIA),
          estado: 'REVISION'
        },
        {
          usuarioId: part3.usuarioId,
          causaId: causa6.causaId,
          nombre: 'Campaña Vivero Escolar Chiquitano',
          descripcion: 'Implementación de vivero escolar con sistema de riego por goteo.',
          precioTicket: '15.00',
          cantidadTickets: 80,
          fechaInicio: new Date(ahora + 3 * DIA),
          fechaFin: new Date(ahora + 18 * DIA),
          estado: 'ESPERANDO_PAGO',
          revisadoPorId: adminId,
          observacion: 'Propuesta aprobada preliminarmente, esperando arancel de publicación.'
        }
      ]
    });
  }

  console.log('✅ Seed demo ampliado ejecutado correctamente.');
}

main()
  .catch((err) => {
    console.error('❌ Error ejecutando seed demo:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
