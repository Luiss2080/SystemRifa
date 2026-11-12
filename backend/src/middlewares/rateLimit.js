import { rateLimit, MemoryStore } from 'express-rate-limit';

const stores = [];

function createLimiter({ windowMs, max, message }) {
  const store = new MemoryStore();
  stores.push(store);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message
        }
      });
    }
  });
}

export const loginRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.'
});

export function resetRateLimiters() {
  for (const store of stores) {
    store.resetAll();
  }
}
