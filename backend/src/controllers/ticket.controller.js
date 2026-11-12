import * as ticketService from '../services/ticket.service.js';

export async function getTicketsRifa(req, res, next) {
  try {
    const data = await ticketService.obtenerMapaTicketsPublico(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postReservarTickets(req, res, next) {
  try {
    const data = await ticketService.reservarTickets(
      req.user.usuarioId,
      req.params.id,
      req.body.numeros
    );
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteLiberarReservas(req, res, next) {
  try {
    const data = await ticketService.liberarReservas(
      req.user.usuarioId,
      req.params.id,
      req.body?.numeros
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMisTickets(req, res, next) {
  try {
    const data = await ticketService.listarMisTickets(req.user.usuarioId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postAnularTicket(req, res, next) {
  try {
    const data = await ticketService.anularTicket(req.user, req.params.id, req.body.motivo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
