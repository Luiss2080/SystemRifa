import * as authService from '../services/auth.service.js';

export async function postRegistro(req, res, next) {
  try {
    const data = await authService.registrar(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postLogin(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postRefresh(req, res, next) {
  try {
    const data = await authService.refresh(req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postLogout(req, res, next) {
  try {
    const data = await authService.logout(req.user.usuarioId, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const data = await authService.obtenerPerfilAutenticado(req.user.usuarioId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
