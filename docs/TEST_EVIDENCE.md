# Evidencias reales de la entrega

Esta carpeta conserva los logs obtenidos en la computadora del estudiante. No reemplaces resultados por texto inventado.

## Generación automática en Windows

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\verify-delivery.ps1 -DockerHubUser TU_USUARIO_DOCKERHUB -Version 1.0.0
```

El script crea:

1. versiones de Node, npm, Git y Docker;
2. instalación reproducible con `npm ci`;
3. ESLint;
4. tests y cobertura;
5. smoke test del núcleo;
6. auditoría de producción;
7. validación y build del Dockerfile;
8. inicio y estado de Docker Compose;
9. logs de la API;
10. respuestas de `/health` y `/docs.json`;
11. inspección de la imagen;
12. Docker Scout, cuando está disponible.

Además de los logs, agrega al Google Docs capturas legibles de las salidas principales y de las páginas públicas de GitHub y Docker Hub.
