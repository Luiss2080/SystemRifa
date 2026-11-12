const SENSITIVE_KEYS = new Set([
  'password',
  'passwordactual',
  'passwordnueva',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret'
]);

export function sanitizeForLog(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeForLog(val);
      }
    }
    return out;
  }
  return value;
}

export function logInfo(event, meta = {}) {
  console.log(
    JSON.stringify({
      level: 'info',
      event,
      timestamp: new Date().toISOString(),
      ...sanitizeForLog(meta)
    })
  );
}

export function logError(event, err, meta = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      event,
      timestamp: new Date().toISOString(),
      message: err?.message || String(err),
      ...(err?.code ? { code: err.code } : {}),
      ...sanitizeForLog(meta)
    })
  );
}
