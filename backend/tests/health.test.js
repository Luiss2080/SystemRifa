import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { resetDb } from './helpers/resetDb.js';

describe('GET /api/health', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('responde 200 y confirma conexión con MySQL mediante Prisma', async () => {
    await resetDb();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.timestamp).toBeTypeOf('string');
  });

  it('responde 404 con formato de error uniforme para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-inexistente');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Ruta no encontrada: GET /api/ruta-inexistente'
      }
    });
  });
});

