# Validación realizada antes de entregar el ZIP

Fecha UTC: 2026-07-22 21:02:51  
Node disponible en el entorno de creación: v22.16.0  
npm disponible: 10.9.2

## Resultados reales

1. Validación JSON de `package.json`: **PASS**.
2. Resolución de todos los imports relativos: **PASS**.
3. Validación sintáctica con `node --check`: **PASS** en 24 archivos JavaScript.
4. Smoke test del núcleo de adopciones: **PASS** (`Core smoke test passed: success, validation, concurrency and rollback`).
5. Conteo de pruebas escritas: **22 funcionales + 7 de soporte = 29 pruebas**.

```text
PASS eslint.config.js
PASS scripts/seed.js
PASS scripts/smoke-core.js
PASS src/app.js
PASS src/config/env.config.js
PASS src/controllers/adoptions.controller.js
PASS src/dao/mongo/models/adoption.model.js
PASS src/dao/mongo/models/pet.model.js
PASS src/dao/mongo/models/user.model.js
PASS src/dao/mongo/repositories/adoptions.mongo.repository.js
PASS src/dao/mongo/repositories/pets.mongo.repository.js
PASS src/dao/mongo/repositories/users.mongo.repository.js
PASS src/docs/swagger.js
PASS src/middlewares/error.middleware.js
PASS src/routes/adoption.router.js
PASS src/server.js
PASS src/services/adoptions.service.js
PASS src/utils/api-error.js
PASS src/utils/async-handler.js
PASS src/utils/object-id.js
PASS test/fakes/in-memory-repositories.js
PASS test/functional/adoption.router.test.js
PASS test/helpers.js
PASS test/unit/application-support.test.js
Core smoke test passed: success, validation, concurrency and rollback
```

## Pruebas que deben repetirse en la computadora del estudiante

La instalación completa, Mocha/Supertest, cobertura, auditoría, construcción Docker, ejecución del contenedor y Docker Scout requieren acceso al registro npm y Docker Engine. El intento de generar el lockfile en este entorno no pudo completarse por indisponibilidad del registro de paquetes. Por eso el ZIP incluye `scripts/prepare-repository.ps1`, que genera un `package-lock.json` real en la computadora del estudiante y ejecuta la calidad completa antes del primer commit.

No se presentan logs ficticios. Ejecuta `scripts/verify-delivery.ps1` para producir la evidencia definitiva.
