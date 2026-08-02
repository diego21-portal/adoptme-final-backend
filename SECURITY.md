# Política de seguridad

## Versiones soportadas

| Versión | Soporte |
|---|---|
| 1.0.x | Sí |

## Reporte responsable

No publiques credenciales, tokens, `.env`, datos personales ni cadenas de conexión privadas en issues. Informa el problema al propietario del repositorio por un canal privado.

## Controles incluidos

- dependencias exactas y `package-lock.json` generado antes de publicar;
- auditoría de dependencias de producción;
- Helmet y `x-powered-by` deshabilitado;
- límite de cuerpo JSON de 64 KB;
- errores internos sin detalles sensibles;
- contenedor ejecutado como usuario no root;
- `no-new-privileges` en Docker Compose;
- health check y escaneo con Docker Scout;
- secretos de Docker Hub almacenados en GitHub Actions Secrets.
