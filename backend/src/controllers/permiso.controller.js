import * as permisoService from '../services/permiso.service.js';

export async function getRoles(_req, res, next) {
  try {
    const data = await permisoService.listarRoles();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postRol(req, res, next) {
  try {
    const data = await permisoService.crearRol(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchRol(req, res, next) {
  try {
    const data = await permisoService.actualizarRol(req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteRol(req, res, next) {
  try {
    const data = await permisoService.eliminarRol(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPermisos(req, res, next) {
  try {
    const data = await permisoService.listarPermisos(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postPermiso(req, res, next) {
  try {
    const data = await permisoService.crearPermiso(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function patchPermiso(req, res, next) {
  try {
    const data = await permisoService.actualizarPermiso(req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePermiso(req, res, next) {
  try {
    const data = await permisoService.eliminarPermiso(req.params.id, req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function putUsuarioRol(req, res, next) {
  try {
    const data = await permisoService.asignarRolAUsuario(
      req.user.usuarioId,
      req.params.id,
      req.params.rolId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteUsuarioRol(req, res, next) {
  try {
    const data = await permisoService.quitarRolAUsuario(
      req.user.usuarioId,
      req.params.id,
      req.params.rolId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function putRolPermiso(req, res, next) {
  try {
    const data = await permisoService.asignarPermisoARol(
      req.user.usuarioId,
      req.params.id,
      req.params.permisoId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteRolPermiso(req, res, next) {
  try {
    const data = await permisoService.quitarPermisoARol(
      req.user.usuarioId,
      req.params.id,
      req.params.permisoId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function putUsuarioPermiso(req, res, next) {
  try {
    const data = await permisoService.asignarPermisoAUsuario(
      req.user.usuarioId,
      req.params.id,
      req.params.permisoId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteUsuarioPermiso(req, res, next) {
  try {
    const data = await permisoService.quitarPermisoAUsuario(
      req.user.usuarioId,
      req.params.id,
      req.params.permisoId
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUsuarioPermisosEfectivos(req, res, next) {
  try {
    const data = await permisoService.obtenerPermisosEfectivos(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getHistorialPermisos(req, res, next) {
  try {
    const data = await permisoService.listarHistorialPermisos(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

