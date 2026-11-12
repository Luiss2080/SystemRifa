export class AppError extends Error {
  /**
   * Error de aplicación uniforme para respuestas HTTP controladas.
   * @param {number} status Código HTTP
   * @param {string} code Código interno legible por máquina
   * @param {string} message Mensaje legible para el cliente
   * @param {unknown} [details] Detalles opcionales (errores de validación, conflictos, etc.)
   */
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
