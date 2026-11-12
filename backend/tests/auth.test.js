import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';

const BASE_USER = {
  alias: 'maria_solidaria',
  email: 'maria@ejemplo.com',
  telefono: '70012345',
  nombres: 'María Elena',
  apellidos: 'Suárez',
  password: 'Password123'
};

describe('Módulo de Autenticación y Perfil (Paso 3)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/auth/registro crea participante, asigna rol PARTICIPANTE y oculta passwordHash', async () => {
    const res = await request(app).post('/api/auth/registro').send(BASE_USER);

    expect(res.status).toBe(201);
    expect(res.body.usuario).toMatchObject({
      alias: BASE_USER.alias,
      email: BASE_USER.email,
      telefono: BASE_USER.telefono,
      nombres: BASE_USER.nombres,
      apellidos: BASE_USER.apellidos,
      activo: true,
      roles: ['PARTICIPANTE']
    });
    expect(res.body.usuario.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(BASE_USER.password);
  });

  it('POST /api/auth/registro devuelve 409 si alias, email o teléfono ya existen', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);

    const dupEmail = await request(app)
      .post('/api/auth/registro')
      .send({ ...BASE_USER, alias: 'otro_alias', telefono: '79999999' });
    expect(dupEmail.status).toBe(409);

    const dupAlias = await request(app)
      .post('/api/auth/registro')
      .send({ ...BASE_USER, email: 'otra@ejemplo.com', telefono: '79999998' });
    expect(dupAlias.status).toBe(409);

    const dupTel = await request(app)
      .post('/api/auth/registro')
      .send({ ...BASE_USER, alias: 'otro_alias2', email: 'otra2@ejemplo.com' });
    expect(dupTel.status).toBe(409);
  });

  it('POST /api/auth/registro rechaza contraseña inválida con 400', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ ...BASE_USER, password: 'sololetras' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/login devuelve accessToken y refreshToken (hash guardado) para credenciales válidas', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);

    const res = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.refreshToken).toBeTypeOf('string');
    expect(res.body.usuario.passwordHash).toBeUndefined();

    const tokens = await prisma.refreshToken.findMany({
      where: { usuarioId: res.body.usuario.usuarioId }
    });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].tokenHash).not.toBe(res.body.refreshToken);
    expect(tokens[0].tokenHash).toHaveLength(64);
  });

  it('POST /api/auth/login devuelve 401 genérico con credenciales inválidas', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);

    const badPass = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: 'WrongPassword1'
    });
    const badEmail = await request(app).post('/api/auth/login').send({
      email: 'noexiste@ejemplo.com',
      password: 'WrongPassword1'
    });

    expect(badPass.status).toBe(401);
    expect(badEmail.status).toBe(401);
    expect(badPass.body.error.message).toBe(badEmail.body.error.message);
  });

  it('POST /api/auth/login devuelve 403 si el usuario está inactivo', async () => {
    const reg = await request(app).post('/api/auth/registro').send(BASE_USER);
    await prisma.usuario.update({
      where: { usuarioId: reg.body.usuario.usuarioId },
      data: { activo: false }
    });

    const res = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('USER_INACTIVE');
  });

  it('POST /api/auth/login aplica rate limit de 10 intentos por 15 minutos', async () => {
    for (let i = 0; i < 10; i++) {
      const attempt = await request(app).post('/api/auth/login').send({
        email: 'noexiste@ejemplo.com',
        password: 'WrongPassword1'
      });
      expect(attempt.status).toBe(401);
    }

    const blocked = await request(app).post('/api/auth/login').send({
      email: 'noexiste@ejemplo.com',
      password: 'WrongPassword1'
    });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('POST /api/auth/refresh rota el token y revoca todos si se reutiliza uno revocado', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    const firstRefresh = loginRes.body.refreshToken;
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefresh });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeTypeOf('string');
    expect(refreshRes.body.refreshToken).not.toBe(firstRefresh);

    // Reutilizar el token anterior ya revocado
    const reuseRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefresh });
    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe('TOKEN_REUSED');

    // El nuevo token emitido también debe haber quedado revocado por seguridad
    const secondTry = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshRes.body.refreshToken });
    expect(secondTry.status).toBe(401);
  });

  it('POST /api/auth/logout revoca el refresh token recibido', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(logoutRes.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(refreshAfterLogout.status).toBe(401);
  });

  it('GET /api/auth/me exige token (401) y devuelve datos, roles y permisos efectivos', async () => {
    const noToken = await request(app).get('/api/auth/me');
    expect(noToken.status).toBe(401);

    await request(app).post('/api/auth/registro').send(BASE_USER);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.usuario.email).toBe(BASE_USER.email);
    expect(meRes.body.usuario.passwordHash).toBeUndefined();
    expect(meRes.body.roles).toEqual(['PARTICIPANTE']);
    expect(meRes.body.permisos).toEqual([
      'notificaciones:leer',
      'pagos:registrar',
      'rifas:leer',
      'solicitudes:crear',
      'tickets:comprar'
    ]);
  });

  it('PATCH /api/usuarios/me actualiza el perfil y respeta unicidad (409)', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);
    await request(app).post('/api/auth/registro').send({
      ...BASE_USER,
      alias: 'carlos_dev',
      email: 'carlos@ejemplo.com',
      telefono: '71111111'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    const conflict = await request(app)
      .patch('/api/usuarios/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({ alias: 'carlos_dev' });
    expect(conflict.status).toBe(409);

    const updated = await request(app)
      .patch('/api/usuarios/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({ nombres: 'María Fernanda', telefono: '72222222' });

    expect(updated.status).toBe(200);
    expect(updated.body.usuario.nombres).toBe('María Fernanda');
    expect(updated.body.usuario.telefono).toBe('72222222');
  });

  it('PATCH /api/usuarios/me/password exige contraseña actual e invalida los refresh tokens existentes', async () => {
    await request(app).post('/api/auth/registro').send(BASE_USER);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: BASE_USER.password
    });

    const badCurrent = await request(app)
      .patch('/api/usuarios/me/password')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({
        passwordActual: 'Incorrecta1',
        passwordNueva: 'NuevaClave123'
      });
    expect(badCurrent.status).toBe(401);

    const okChange = await request(app)
      .patch('/api/usuarios/me/password')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({
        passwordActual: BASE_USER.password,
        passwordNueva: 'NuevaClave123'
      });
    expect(okChange.status).toBe(200);

    // Refresh token previo debe estar revocado
    const refreshAfterChange = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(refreshAfterChange.status).toBe(401);

    // Login con la nueva contraseña funciona
    const loginNew = await request(app).post('/api/auth/login').send({
      email: BASE_USER.email,
      password: 'NuevaClave123'
    });
    expect(loginNew.status).toBe(200);
  });
});

