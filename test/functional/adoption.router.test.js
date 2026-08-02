import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import { buildTestContext, IDS } from '../helpers.js';

process.env.NODE_ENV = 'test';

describe('Tests funcionales de adoption.router.js', () => {
  afterEach(() => {
    sinon.restore();
    process.env.NODE_ENV = 'test';
  });

  describe('GET /api/adoptions', () => {
    it('devuelve todas las adopciones con status 200', async () => {
      const { app } = buildTestContext();
      const response = await request(app).get('/api/adoptions');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array').with.length(1);
      expect(response.body.payload[0]).to.include({ _id: IDS.adoption });
    });

    it('devuelve un arreglo vacío cuando no existen adopciones', async () => {
      const { app, adoptionsRepository } = buildTestContext();
      adoptionsRepository.adoptions.clear();

      const response = await request(app).get('/api/adoptions');
      expect(response.status).to.equal(200);
      expect(response.body.payload).to.deep.equal([]);
    });

    it('devuelve 500 cuando el repositorio falla', async () => {
      const { app, adoptionsRepository } = buildTestContext();
      sinon.stub(adoptionsRepository, 'getAll').rejects(new Error('database unavailable'));

      const response = await request(app).get('/api/adoptions');
      expect(response.status).to.equal(500);
      expect(response.body.error).to.deep.include({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
    });
  });

  describe('GET /api/adoptions/:aid', () => {
    it('devuelve una adopción existente con status 200', async () => {
      const { app } = buildTestContext();
      const response = await request(app).get(`/api/adoptions/${IDS.adoption}`);

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.deep.include({ _id: IDS.adoption });
    });

    it('devuelve 400 para un ID de adopción inválido', async () => {
      const { app } = buildTestContext();
      const response = await request(app).get('/api/adoptions/id-invalido');

      expect(response.status).to.equal(400);
      expect(response.body.error).to.deep.include({ code: 'INVALID_ADOPTION_ID' });
      expect(response.body.error.details).to.deep.equal({ field: 'aid' });
    });

    it('devuelve 404 cuando la adopción no existe', async () => {
      const { app } = buildTestContext();
      const response = await request(app).get(`/api/adoptions/${IDS.missingAdoption}`);

      expect(response.status).to.equal(404);
      expect(response.body.error.code).to.equal('ADOPTION_NOT_FOUND');
    });

    it('devuelve 500 cuando falla la consulta de una adopción', async () => {
      const { app, adoptionsRepository } = buildTestContext();
      sinon.stub(adoptionsRepository, 'getById').rejects(new Error('query failed'));

      const response = await request(app).get(`/api/adoptions/${IDS.adoption}`);
      expect(response.status).to.equal(500);
      expect(response.body.error.code).to.equal('INTERNAL_SERVER_ERROR');
    });
  });

  describe('POST /api/adoptions/:uid/:pid', () => {
    it('crea una adopción y actualiza usuario y mascota', async () => {
      const { app, usersRepository, petsRepository, adoptionsRepository } =
        buildTestContext();
      const response = await request(app).post(
        `/api/adoptions/${IDS.user}/${IDS.pet}`,
      );

      expect(response.status).to.equal(201);
      expect(response.body).to.deep.include({
        status: 'success',
        message: 'Pet adopted',
      });
      expect(response.body.payload).to.include({ owner: IDS.user, pet: IDS.pet });
      expect((await usersRepository.getById(IDS.user)).pets).to.include(IDS.pet);
      expect(await petsRepository.getById(IDS.pet)).to.include({
        adopted: true,
        owner: IDS.user,
      });
      expect(await adoptionsRepository.getById(response.body.payload._id)).to.include({
        owner: IDS.user,
        pet: IDS.pet,
      });
    });

    it('devuelve 400 cuando el user ID es inválido', async () => {
      const { app } = buildTestContext();
      const response = await request(app).post(`/api/adoptions/invalido/${IDS.pet}`);

      expect(response.status).to.equal(400);
      expect(response.body.error.code).to.equal('INVALID_USER_ID');
      expect(response.body.error.details).to.deep.equal({ field: 'uid' });
    });

    it('devuelve 400 cuando el pet ID es inválido', async () => {
      const { app } = buildTestContext();
      const response = await request(app).post(`/api/adoptions/${IDS.user}/invalido`);

      expect(response.status).to.equal(400);
      expect(response.body.error.code).to.equal('INVALID_PET_ID');
      expect(response.body.error.details).to.deep.equal({ field: 'pid' });
    });

    it('devuelve 404 cuando el usuario no existe', async () => {
      const { app } = buildTestContext();
      const response = await request(app).post(
        `/api/adoptions/${IDS.missingUser}/${IDS.pet}`,
      );

      expect(response.status).to.equal(404);
      expect(response.body.error.code).to.equal('USER_NOT_FOUND');
    });

    it('devuelve 404 cuando la mascota no existe', async () => {
      const { app } = buildTestContext();
      const response = await request(app).post(
        `/api/adoptions/${IDS.user}/${IDS.missingPet}`,
      );

      expect(response.status).to.equal(404);
      expect(response.body.error.code).to.equal('PET_NOT_FOUND');
    });

    it('devuelve 400 cuando la mascota ya está adoptada', async () => {
      const { app } = buildTestContext();
      const response = await request(app).post(
        `/api/adoptions/${IDS.user}/${IDS.adoptedPet}`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.error.code).to.equal('PET_ALREADY_ADOPTED');
    });

    it('devuelve 400 cuando la mascota tiene propietario aunque adopted sea false', async () => {
      const { app, petsRepository } = buildTestContext();
      const pet = petsRepository.pets.get(IDS.pet);
      pet.adopted = false;
      pet.owner = IDS.existingOwner;

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);
      expect(response.status).to.equal(400);
      expect(response.body.error.code).to.equal('PET_ALREADY_ADOPTED');
    });

    it('devuelve 409 cuando otra solicitud reclama la mascota primero', async () => {
      const { app, petsRepository } = buildTestContext();
      sinon.stub(petsRepository, 'claimForAdoption').resolves(null);

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);
      expect(response.status).to.equal(409);
      expect(response.body.error.code).to.equal('PET_UPDATE_CONFLICT');
    });

    it('devuelve 500 y libera la mascota si falla la actualización del usuario', async () => {
      const { app, usersRepository, petsRepository } = buildTestContext();
      sinon.stub(usersRepository, 'addPet').rejects(new Error('user update failed'));

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);
      expect(response.status).to.equal(500);
      expect(await petsRepository.getById(IDS.pet)).to.include({
        adopted: false,
        owner: null,
      });
    });

    it('devuelve 404 y libera la mascota si el usuario desaparece durante la operación', async () => {
      const { app, usersRepository, petsRepository } = buildTestContext();
      sinon.stub(usersRepository, 'addPet').resolves(null);

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);
      expect(response.status).to.equal(404);
      expect(response.body.error.code).to.equal('USER_NOT_FOUND');
      expect(await petsRepository.getById(IDS.pet)).to.include({
        adopted: false,
        owner: null,
      });
    });

    it('devuelve 500 y revierte usuario y mascota si falla la creación', async () => {
      const { app, adoptionsRepository, usersRepository, petsRepository } =
        buildTestContext();
      sinon.stub(adoptionsRepository, 'create').rejects(new Error('insert failed'));

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);
      expect(response.status).to.equal(500);
      expect((await usersRepository.getById(IDS.user)).pets).to.deep.equal([]);
      expect(await petsRepository.getById(IDS.pet)).to.include({
        adopted: false,
        owner: null,
      });
    });

    it('registra un rollback incompleto fuera de test sin exponer detalles al cliente', async () => {
      process.env.NODE_ENV = 'production';
      const consoleStub = sinon.stub(console, 'error');
      const { app, adoptionsRepository, petsRepository } = buildTestContext();
      sinon.stub(adoptionsRepository, 'create').rejects(new Error('insert failed'));
      sinon.stub(petsRepository, 'releaseIfOwnedBy').rejects(new Error('rollback failed'));

      const response = await request(app).post(`/api/adoptions/${IDS.user}/${IDS.pet}`);

      expect(response.status).to.equal(500);
      expect(response.body.error.message).to.equal('Internal server error');
      expect(consoleStub.called).to.equal(true);
    });

    it('permite una sola adopción cuando llegan dos solicitudes simultáneas', async () => {
      const { app, adoptionsRepository, usersRepository, petsRepository } =
        buildTestContext();
      const endpoint = `/api/adoptions/${IDS.user}/${IDS.pet}`;

      const responses = await Promise.all([
        request(app).post(endpoint),
        request(app).post(endpoint),
      ]);
      const statuses = responses.map((response) => response.status).sort();

      expect(statuses).to.deep.equal([201, 409]);
      expect((await usersRepository.getById(IDS.user)).pets).to.deep.equal([IDS.pet]);
      expect(await petsRepository.getById(IDS.pet)).to.include({
        adopted: true,
        owner: IDS.user,
      });
      expect(await adoptionsRepository.getAll()).to.have.length(2);
    });
  });

  describe('Rutas auxiliares y no encontradas', () => {
    it('responde correctamente al health check y publica OpenAPI', async () => {
      const { app } = buildTestContext();
      const health = await request(app).get('/health');
      const docs = await request(app).get('/docs.json');

      expect(health.status).to.equal(200);
      expect(health.body).to.include({ status: 'success', service: 'adoptme-api' });
      expect(health.body.uptime).to.be.a('number');
      expect(docs.status).to.equal(200);
      expect(docs.body.openapi).to.equal('3.0.3');
    });

    it('devuelve 404 para una ruta inexistente', async () => {
      const { app } = buildTestContext();
      const response = await request(app).get('/api/ruta-inexistente');

      expect(response.status).to.equal(404);
      expect(response.body.error.code).to.equal('ROUTE_NOT_FOUND');
    });
  });
});
