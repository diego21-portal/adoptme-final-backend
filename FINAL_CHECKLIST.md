# Checklist final antes de enviar a Ticher

- [ ] Instalé Node.js 24 LTS y Docker Desktop.
- [ ] Ejecuté `scripts/prepare-repository.ps1` y confirmé que se creó `package-lock.json`.
- [ ] Ejecuté `scripts/verify-delivery.ps1` y todos los pasos terminaron correctamente.
- [ ] El repositorio GitHub es público y la rama `main` contiene `package-lock.json`.
- [ ] GitHub Actions está en verde.
- [ ] Reemplacé `TU_USUARIO_GITHUB` y `TU_USUARIO_DOCKERHUB` en todos los archivos.
- [ ] Creé los secrets `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`.
- [ ] Publiqué el tag `v1.0.0`.
- [ ] Docker Hub muestra los tags `1.0.0`, `1.0` y `latest`.
- [ ] `docker pull TU_USUARIO_DOCKERHUB/adoptme-final-backend:1.0.0` funciona.
- [ ] Ejecuté Docker Scout y guardé el resultado real.
- [ ] Pegué logs o capturas legibles en el Google Docs.
- [ ] Copié el README completo dentro del Google Docs.
- [ ] Abrí GitHub, Docker Hub y Google Docs en incógnito sin iniciar sesión.
- [ ] Entregué la URL pública del Google Docs antes del 6 de agosto de 2026 a las 20:59.
