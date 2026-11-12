import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const ROLES = [
  {
    nombre: 'ADMINISTRADOR',
    descripcion: 'Acceso total a la administración, verificación de pagos, solicitudes, usuarios y reportes'
  },
  {
    nombre: 'ORGANIZADOR',
    descripcion: 'Gestión de sus propias rifas aprobadas, premios, sorteos y reportes'
  },
  {
    nombre: 'PARTICIPANTE',
    descripcion: 'Usuario participante que puede comprar tickets, registrar pagos y solicitar rifas'
  }
];

const PERMISOS = [
  { recurso: 'usuarios', accion: 'leer', nombre: 'Listar y ver usuarios' },
  { recurso: 'usuarios', accion: 'administrar', nombre: 'Activar o desactivar cuentas' },
  { recurso: 'roles', accion: 'administrar', nombre: 'CRUD de roles y asignarlos' },
  { recurso: 'permisos', accion: 'administrar', nombre: 'CRUD de permisos y asignarlos' },
  { recurso: 'causas', accion: 'crud', nombre: 'Gestionar causas solidarias' },
  { recurso: 'solicitudes', accion: 'crear', nombre: 'Enviar solicitud de rifa' },
  { recurso: 'solicitudes', accion: 'revisar', nombre: 'Revisar, cambiar estado, aprobar' },
  { recurso: 'rifas', accion: 'leer', nombre: 'Ver mis rifas y detalle interno' },
  { recurso: 'rifas', accion: 'administrar', nombre: 'Extender, finalizar, anular tickets' },
  { recurso: 'premios', accion: 'crud', nombre: 'Crear, editar, desactivar premios' },
  { recurso: 'tickets', accion: 'comprar', nombre: 'Reservar y liberar tickets' },
  { recurso: 'pagos', accion: 'registrar', nombre: 'Registrar pagos propios' },
  { recurso: 'pagos', accion: 'verificar', nombre: 'Confirmar o rechazar pagos' },
  { recurso: 'sorteos', accion: 'realizar', nombre: 'Realizar sorteo' },
  { recurso: 'ganadores', accion: 'publicar', nombre: 'Registrar entrega de premios' },
  { recurso: 'reportes', accion: 'leer', nombre: 'Reportes y auditoría' },
  { recurso: 'notificaciones', accion: 'leer', nombre: 'Ver y gestionar las propias' },
  { recurso: 'plantillas', accion: 'administrar', nombre: 'Editar plantillas de notificación' }
];

const PERMISOS_POR_ROL = {
  ADMINISTRADOR: PERMISOS.map((p) => `${p.recurso}:${p.accion}`),
  ORGANIZADOR: [
    'rifas:administrar',
    'premios:crud',
    'sorteos:realizar',
    'ganadores:publicar',
    'reportes:leer'
  ],
  PARTICIPANTE: [
    'solicitudes:crear',
    'rifas:leer',
    'tickets:comprar',
    'pagos:registrar',
    'notificaciones:leer'
  ]
};

const TIPOS_NOTIFICACION = [
  {
    codigo: 'BIENVENIDA',
    plantillaTitulo: '¡Bienvenido/a a Rifas Solidarias, {alias}!',
    plantillaMensaje:
      'Hola {alias}, tu cuenta fue creada correctamente. Ya puedes explorar rifas solidarias y participar.',
    variables: ['alias']
  },
  {
    codigo: 'NUEVA_SOLICITUD',
    plantillaTitulo: 'Nueva solicitud de rifa: {nombreRifa}',
    plantillaMensaje:
      'El usuario {alias} ha enviado una nueva solicitud para la rifa «{nombreRifa}».',
    variables: ['alias', 'nombreRifa']
  },
  {
    codigo: 'SOLICITUD_RECIBIDA',
    plantillaTitulo: 'Recibimos tu solicitud: {nombreRifa}',
    plantillaMensaje:
      'Tu solicitud para la rifa «{nombreRifa}» fue recibida y se encuentra en revisión.',
    variables: ['nombreRifa']
  },
  {
    codigo: 'SOLICITUD_ACTUALIZADA',
    plantillaTitulo: 'Actualización de tu solicitud: {nombreRifa}',
    plantillaMensaje:
      'Tu solicitud para la rifa «{nombreRifa}» pasó al estado {estado}.',
    variables: ['nombreRifa', 'estado']
  },
  {
    codigo: 'SOLICITUD_APROBADA',
    plantillaTitulo: '¡Solicitud aprobada: {nombreRifa}!',
    plantillaMensaje:
      'Tu solicitud «{nombreRifa}» fue aprobada. La rifa ya fue creada; agrega al menos un premio activo para publicarla en el catálogo.',
    variables: ['nombreRifa']
  },
  {
    codigo: 'SOLICITUD_RECHAZADA',
    plantillaTitulo: 'Solicitud rechazada: {nombreRifa}',
    plantillaMensaje:
      'Tu solicitud para la rifa «{nombreRifa}» fue rechazada. Observación: {observacion}',
    variables: ['nombreRifa', 'observacion']
  },
  {
    codigo: 'TICKET_RESERVADO',
    plantillaTitulo: 'Tickets reservados en {nombreRifa}',
    plantillaMensaje:
      'Reservaste los números {numeros} en «{nombreRifa}». Tienes {minutos} minutos para registrar tu pago.',
    variables: ['nombreRifa', 'numeros', 'minutos']
  },
  {
    codigo: 'RESERVA_VENCIDA',
    plantillaTitulo: 'Reserva vencida en {nombreRifa}',
    plantillaMensaje:
      'Tu reserva de los números {numeros} en «{nombreRifa}» venció por falta de pago y los tickets volvieron a estar disponibles.',
    variables: ['nombreRifa', 'numeros']
  },
  {
    codigo: 'NUEVO_PAGO',
    plantillaTitulo: 'Nuevo pago pendiente en {nombreRifa}',
    plantillaMensaje:
      'El usuario {alias} registró un pago de Bs {monto} para la rifa «{nombreRifa}» pendiente de verificación.',
    variables: ['alias', 'monto', 'nombreRifa']
  },
  {
    codigo: 'PAGO_CONFIRMADO',
    plantillaTitulo: 'Pago confirmado en {nombreRifa}',
    plantillaMensaje:
      'Se confirmó tu pago de Bs {monto} en «{nombreRifa}». Tus tickets {numeros} ya están vendidos y participan del sorteo.',
    variables: ['nombreRifa', 'numeros', 'monto']
  },
  {
    codigo: 'PAGO_RECHAZADO',
    plantillaTitulo: 'Pago rechazado en {nombreRifa}',
    plantillaMensaje:
      'Tu pago en «{nombreRifa}» fue rechazado. Motivo: {motivo}. Los tickets volvieron a estar disponibles.',
    variables: ['nombreRifa', 'motivo']
  },
  {
    codigo: 'SORTEO_REALIZADO',
    plantillaTitulo: 'Sorteo realizado: {nombreRifa}',
    plantillaMensaje:
      'El sorteo de la rifa «{nombreRifa}» ha finalizado. Número ganador principal: #{numeroGanador}.',
    variables: ['nombreRifa', 'numeroGanador']
  },
  {
    codigo: 'GANADOR',
    plantillaTitulo: '¡Felicidades! Ganaste en {nombreRifa}',
    plantillaMensaje:
      'Tu ticket #{numeroGanador} resultó ganador del premio «{premio}» en la rifa «{nombreRifa}».',
    variables: ['nombreRifa', 'numeroGanador', 'premio']
  }
];

export async function runSeed(prismaClient) {
  const rolMap = new Map();
  for (const rolData of ROLES) {
    const rol = await prismaClient.rol.upsert({
      where: { nombre: rolData.nombre },
      update: { descripcion: rolData.descripcion },
      create: rolData
    });
    rolMap.set(rol.nombre, rol);
  }

  const permisoMap = new Map();
  for (const permData of PERMISOS) {
    const permiso = await prismaClient.permiso.upsert({
      where: {
        recurso_accion: {
          recurso: permData.recurso,
          accion: permData.accion
        }
      },
      update: {
        nombre: permData.nombre,
        estaActivo: true
      },
      create: {
        ...permData,
        estaActivo: true
      }
    });
    permisoMap.set(`${permData.recurso}:${permData.accion}`, permiso);
  }

  for (const [nombreRol, claves] of Object.entries(PERMISOS_POR_ROL)) {
    const rol = rolMap.get(nombreRol);
    for (const clave of claves) {
      const permiso = permisoMap.get(clave);
      await prismaClient.permisoRol.upsert({
        where: {
          rolId_permisoId: {
            rolId: rol.rolId,
            permisoId: permiso.permisoId
          }
        },
        update: {},
        create: {
          rolId: rol.rolId,
          permisoId: permiso.permisoId
        }
      });
    }
  }

  for (const tipo of TIPOS_NOTIFICACION) {
    await prismaClient.tipoNotificacion.upsert({
      where: { codigo: tipo.codigo },
      update: {
        plantillaTitulo: tipo.plantillaTitulo,
        plantillaMensaje: tipo.plantillaMensaje,
        variables: tipo.variables,
        estaActivo: true
      },
      create: {
        ...tipo,
        estaActivo: true
      }
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      '⚠️  ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en el entorno; se omite la creación del administrador inicial.'
    );
    return;
  }

  const adminRole = rolMap.get('ADMINISTRADOR');

  let admin = await prismaClient.usuario.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await prismaClient.usuario.create({
      data: {
        alias: 'admin',
        email: adminEmail,
        nombres: 'Administrador',
        apellidos: 'Sistema',
        passwordHash,
        activo: true
      }
    });
  } else if (!admin.activo) {
    admin = await prismaClient.usuario.update({
      where: { usuarioId: admin.usuarioId },
      data: { activo: true }
    });
  }

  await prismaClient.rolUsuario.upsert({
    where: {
      usuarioId_rolId: {
        usuarioId: admin.usuarioId,
        rolId: adminRole.rolId
      }
    },
    update: {},
    create: {
      usuarioId: admin.usuarioId,
      rolId: adminRole.rolId
    }
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const prisma = new PrismaClient();
  runSeed(prisma)
    .then(() => {
      console.log('✅ Seed base ejecutado correctamente.');
    })
    .catch((err) => {
      console.error('❌ Error al ejecutar el seed base:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
