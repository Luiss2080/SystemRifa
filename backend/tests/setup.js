import 'dotenv/config';

process.env.NODE_ENV = 'test';

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST es obligatorio para ejecutar las pruebas.');
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

