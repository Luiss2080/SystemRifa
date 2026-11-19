# Política de seguridad

## Versiones con soporte

| Versión | Soporte |
| --- | --- |
| `main` (última) | ✅ |
| Versiones anteriores | ❌ |

## 🔒 Reportar una vulnerabilidad

**No abras un issue público** para problemas de seguridad.

1. Usá **Security → Report a vulnerability** en este repositorio (aviso privado de GitHub), o contactá al mantenedor a través de su perfil [@Luiss2080](https://github.com/Luiss2080).
2. Incluí: descripción, pasos para reproducir, impacto estimado y, si podés, una propuesta de corrección.

**Tiempos orientativos:** acuse de recibo en 72 h y evaluación inicial en 7 días.

## 🛡️ Buenas prácticas del proyecto

- Las credenciales van en variables de entorno, nunca en el código (usá los archivos `.env.example`).
- Las dependencias se revisan con Dependabot.
- Las contraseñas se guardan con bcrypt (cost 12) y la sesión usa JWT de acceso con refresh token rotativo.
- La API aplica Helmet, límite de peticiones y validación de entradas con Zod.
- Las confirmaciones de pago y los cambios de permisos quedan registrados en auditoría.
