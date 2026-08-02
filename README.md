# AdoptMe API - Entrega Final Backend III

[![CI](https://github.com/TU_USUARIO_GITHUB/adoptme-final-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/TU_USUARIO_GITHUB/adoptme-final-backend/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](#docker)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

API REST de adopciones desarrollada con **Node.js, Express y MongoDB**. El proyecto cubre todos los endpoints de `adoption.router.js` con tests funcionales, fakes y mocks; incluye Docker, Docker Compose, Swagger/OpenAPI, controles de seguridad y CI/CD con GitHub Actions.

> Antes de publicar, reemplaza `TU_USUARIO_GITHUB`, `TU_USUARIO_DOCKERHUB` y `TU_DOCUMENTO`. Después ejecuta la verificación real en tu computadora y agrega las evidencias al Google Docs.

## URLs públicas de la entrega

| Recurso | URL |
|---|---|
| Repositorio GitHub | `https://github.com/TU_USUARIO_GITHUB/adoptme-final-backend` |
| Imagen Docker Hub | `https://hub.docker.com/r/TU_USUARIO_DOCKERHUB/adoptme-final-backend` |
| Tag versionado | `TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0` |
| Tag estable | `TU_USUARIO_DOCKERHUB/adoptme-final-backend:latest` |
| Swagger local | `http://localhost:8080/docs` |
| OpenAPI JSON | `http://localhost:8080/docs.json` |
| Health check | `http://localhost:8080/health` |

## Funcionalidades y calidad

- Tres endpoints de `adoption.router.js` implementados y documentados.
- Casos de éxito, validación, inexistencia, conflicto de concurrencia y error interno.
- Repositorios falsos en memoria para ejecutar tests sin MongoDB.
- Mocks y stubs con Sinon para provocar fallos controlados.
- Actualización atómica de la mascota y compensación ante fallos parciales.
- Cobertura mínima obligatoria: 95 % en líneas, funciones y statements; 90 % en branches.
- Dockerfile multi-stage, usuario no root, health check y etiquetas OCI.
- Docker Compose con MongoDB, health checks y `no-new-privileges`.
- Swagger/OpenAPI en `/docs` y `/docs.json`.
- GitHub Actions para CI y publicación multi-arquitectura en Docker Hub.
- Scripts PowerShell para producir logs de evidencia reproducibles.

## Tecnologías y versiones

| Tecnología | Versión |
|---|---|
| Node.js | 24.18.0 LTS |
| npm | 10.9 o superior |
| Express | 5.2.1 |
| MongoDB | 8.0 mediante Docker Compose |
| Mongoose | 9.7.4 |
| Mocha | 11.7.6 |
| Chai | 6.2.2 |
| Supertest | 7.2.2 |
| Sinon | 22.0.0 |
| c8 | 10.1.3 |
| ESLint | 9.39.2 |

Las dependencias directas están fijadas a versiones exactas. El primer paso obligatorio genera `package-lock.json`; ese archivo debe subirse al repositorio para que `npm ci`, Docker y GitHub Actions utilicen el mismo árbol de dependencias.

## Estructura del proyecto

```text
adoptme-final-backend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── docker-publish.yml
│   └── dependabot.yml
├── docs/
│   ├── evidence/
│   │   └── .gitkeep
│   ├── LOCAL_VALIDATION.md
│   └── TEST_EVIDENCE.md
├── scripts/
│   ├── prepare-repository.ps1
│   ├── prepare-repository.sh
│   ├── project-tree.ps1
│   ├── publish-image.ps1
│   ├── seed.js
│   ├── smoke-core.js
│   └── verify-delivery.ps1
├── src/
│   ├── config/env.config.js
│   ├── controllers/adoptions.controller.js
│   ├── dao/mongo/
│   │   ├── models/
│   │   │   ├── adoption.model.js
│   │   │   ├── pet.model.js
│   │   │   └── user.model.js
│   │   └── repositories/
│   │       ├── adoptions.mongo.repository.js
│   │       ├── pets.mongo.repository.js
│   │       └── users.mongo.repository.js
│   ├── docs/swagger.js
│   ├── middlewares/error.middleware.js
│   ├── routes/adoption.router.js
│   ├── services/adoptions.service.js
│   ├── utils/
│   │   ├── api-error.js
│   │   ├── async-handler.js
│   │   └── object-id.js
│   ├── app.js
│   └── server.js
├── test/
│   ├── fakes/in-memory-repositories.js
│   ├── functional/adoption.router.test.js
│   ├── unit/application-support.test.js
│   └── helpers.js
├── .dockerignore
├── .editorconfig
├── .env.example
├── .gitignore
├── .npmrc
├── .nvmrc
├── compose.yaml
├── DELIVERY_URLS.txt
├── Dockerfile
├── eslint.config.js
├── FINAL_CHECKLIST.md
├── LICENSE
├── package.json
├── README.md
└── SECURITY.md
```

### Responsabilidad de las carpetas

| Ruta | Propósito |
|---|---|
| `src/routes` | Declara los endpoints HTTP de adopciones. |
| `src/controllers` | Valida parámetros y construye respuestas HTTP. |
| `src/services` | Contiene reglas de negocio, concurrencia y compensaciones. |
| `src/dao/mongo` | Implementa persistencia real con Mongoose. |
| `src/middlewares` | Centraliza rutas inexistentes y errores. |
| `test/functional` | Prueba la API con solicitudes HTTP mediante Supertest. |
| `test/fakes` | Reemplaza MongoDB con repositorios en memoria. |
| `docs/evidence` | Guarda logs reales de la verificación final. |
| `.github/workflows` | Ejecuta CI y publica imágenes versionadas. |

## Arquitectura

```text
HTTP request
    ↓
adoption.router.js
    ↓
adoptions.controller.js
    ↓
adoptions.service.js
    ↓
Mongo repositories / in-memory fakes
```

En producción se utilizan repositorios Mongoose. En los tests se inyectan fakes en memoria, por lo que se valida router, controlador y servicio sin depender de una base externa.

## Endpoints de adopciones

Base URL: `http://localhost:8080/api/adoptions`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/adoptions` | Lista todas las adopciones. |
| `GET` | `/api/adoptions/:aid` | Obtiene una adopción por ID. |
| `POST` | `/api/adoptions/:uid/:pid` | Registra que un usuario adopta una mascota. |

### Validaciones y seguridad funcional

- `aid`, `uid` y `pid` deben ser ObjectId de 24 caracteres hexadecimales.
- El usuario y la mascota deben existir.
- Una mascota adoptada o con propietario no puede volver a adoptarse.
- El reclamo de la mascota es atómico para detectar solicitudes simultáneas.
- Los fallos parciales intentan revertir usuario y mascota antes de responder.
- Los errores internos no exponen mensajes de base de datos ni stack traces.
- La aplicación deshabilita `x-powered-by`, usa Helmet y limita JSON a 64 KB.

## Instalación local en Windows

### Requisitos

- Node.js 24.18.0 LTS.
- npm 10.9 o superior.
- Git.
- Docker Desktop para la ejecución contenedorizada.

### 1. Preparar el repositorio

Desde PowerShell, en la carpeta raíz:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\prepare-repository.ps1
```

El script genera `package-lock.json`, instala con `npm ci` y ejecuta lint, tests, cobertura y smoke test. **Sube el lockfile a GitHub.**

En Linux/macOS:

```bash
chmod +x scripts/prepare-repository.sh
./scripts/prepare-repository.sh
```

### 2. Variables de entorno

```powershell
Copy-Item .env.example .env
```

El `.env` local no se sube al repositorio.

### 3. Ejecutar sin Docker

Inicia MongoDB local y luego:

```powershell
npm run seed
npm start
```

La API queda disponible en `http://localhost:8080`.

## Tests funcionales

La suite incluye **22 tests funcionales** y **7 tests de soporte**.

- `GET /api/adoptions`: listado con datos, listado vacío y error del repositorio.
- `GET /api/adoptions/:aid`: éxito, ID inválido, inexistencia y error interno.
- `POST /api/adoptions/:uid/:pid`: éxito, IDs inválidos, entidades inexistentes, mascota adoptada, propietario inconsistente, conflicto atómico, fallos de persistencia, rollbacks y concurrencia.
- Rutas auxiliares: health check, OpenAPI y ruta inexistente.
- Soporte: dependencias requeridas, `headersSent`, errores controlados, logging, ObjectId y `asyncHandler`.

### Comandos

```powershell
npm test
npm run test:functional
npm run test:coverage
npm run lint
npm run check
npm run audit:prod
```

La cobertura falla automáticamente si baja de:

- Lines: 95 %.
- Statements: 95 %.
- Functions: 95 %.
- Branches: 90 %.

## Docker

### Decisiones de optimización

1. Imagen oficial `node:24.18.0-alpine`, con una versión LTS concreta.
2. Multi-stage build para excluir herramientas de desarrollo de la imagen final.
3. Solo dependencias de producción en runtime.
4. `npm ci` cuando existe `package-lock.json` y una alternativa controlada para el ZIP inicial.
5. `package*.json` se copia antes del código para aprovechar la caché.
6. El proceso se ejecuta como usuario `node`, no como root.
7. `.dockerignore` reduce el contexto del build.
8. `HEALTHCHECK` consulta `/health` con `fetch` nativo.
9. `CMD` usa formato exec para recibir señales correctamente.
10. Etiquetas OCI registran versión, revisión, licencia y origen.
11. Docker Compose agrega health checks y `no-new-privileges`.

### Validar y construir

```powershell
docker build --check .
docker build `
  --build-arg APP_VERSION=1.0.0 `
  --build-arg VCS_REF=local `
  -t TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0 `
  -t TU_USUARIO_DOCKERHUB/adoptme-final-backend:latest .
```

### Ejecutar con Docker Compose

```powershell
docker compose up --build -d
docker compose ps
docker compose logs api
Invoke-RestMethod http://localhost:8080/health
```

La API no necesita datos de ejemplo para iniciar. El comando `npm run seed` se utiliza solamente en desarrollo local, con MongoDB disponible.

Detener:

```powershell
docker compose down
```

Eliminar también el volumen de MongoDB:

```powershell
docker compose down -v
```

### Ejecutar la imagen publicada

```powershell
docker network create adoptme-network
docker run -d --name adoptme-mongo --network adoptme-network -v adoptme-mongo-data:/data/db mongo:8.0
docker run -d `
  --name adoptme-api `
  --network adoptme-network `
  -p 8080:8080 `
  -e MONGO_URL=mongodb://adoptme-mongo:27017 `
  -e DB_NAME=adoptme `
  TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0
```

## Publicación en Docker Hub

1. Crea un repositorio público llamado `adoptme-final-backend`.
2. Crea un Access Token en Docker Hub; no uses la contraseña personal en GitHub.
3. Inicia sesión:

```powershell
docker login -u TU_USUARIO_DOCKERHUB
```

4. Publica manualmente:

```powershell
.\scripts\publish-image.ps1 -DockerHubUser TU_USUARIO_DOCKERHUB -Version 1.0.0
```

5. Comprueba que `1.0.0` y `latest` sean públicos.

### Escaneo de seguridad

```powershell
npm audit --omit=dev
docker scout quickview TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0
docker scout cves TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0
docker scout recommendations TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0
```

Guarda el resultado real en `docs/evidence/`.

## Generar todas las evidencias

Con Docker Desktop abierto:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\verify-delivery.ps1 `
  -DockerHubUser TU_USUARIO_DOCKERHUB `
  -Version 1.0.0
```

Los logs quedan en `docs/evidence/`. Consulta `docs/TEST_EVIDENCE.md`.

## CI/CD

### Integración continua

`.github/workflows/ci.yml` ejecuta:

```text
npm ci
npm run check
npm run audit:prod
```

El workflow exige que `package-lock.json` esté comprometido en Git.

### Publicación automática

Agrega en GitHub:

```text
Settings > Secrets and variables > Actions
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Después publica la versión:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

El workflow construye para `linux/amd64` y `linux/arm64`, genera SBOM/provenance y publica `1.0.0`, `1.0` y `latest`.

## Subir a GitHub

```powershell
git init
git add .
git commit -m "feat: complete final delivery with functional tests and Docker"
git branch -M main
git remote add origin https://github.com/TU_USUARIO_GITHUB/adoptme-final-backend.git
git push -u origin main
```

No subas `.env`, contraseñas ni tokens.

## Lista final

Consulta [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) antes de enviar el enlace a Ticher.

## Autor

**Diego Portal** - Backend III - 2026.

## Licencia

MIT.
