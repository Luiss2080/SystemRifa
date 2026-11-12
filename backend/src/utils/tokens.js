import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
};

/**
 * Convierte una duración tipo "15m" o "7d" a milisegundos.
 * @param {string} ttl
 * @returns {number}
 */
export function parseDurationToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) {
    throw new Error(`Formato de duración inválido: ${ttl}`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * UNIT_MS[unit];
}

export function signAccessToken({ usuarioId, roles }) {
  return jwt.sign(
    {
      usuarioId,
      roles
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: String(usuarioId),
      expiresIn: env.ACCESS_TTL
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function getRefreshExpirationDate() {
  return new Date(Date.now() + parseDurationToMs(env.REFRESH_TTL));
}
