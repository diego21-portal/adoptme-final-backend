import assert from 'node:assert/strict';
import { AdoptionsService } from '../src/services/adoptions.service.js';
import {
  FakeAdoptionsRepository,
  FakePetsRepository,
  FakeUsersRepository,
} from '../test/fakes/in-memory-repositories.js';

process.env.NODE_ENV = 'test';

const IDS = {
  user: '64b000000000000000000001',
  otherUser: '64b000000000000000000002',
  pet: '64b000000000000000000011',
  adoptedPet: '64b000000000000000000012',
  missing: '64b000000000000000000099',
};

const buildService = () => {
  const usersRepository = new FakeUsersRepository([
    { _id: IDS.user, pets: [] },
  ]);
  const petsRepository = new FakePetsRepository([
    { _id: IDS.pet, adopted: false, owner: null },
    { _id: IDS.adoptedPet, adopted: true, owner: IDS.otherUser },
  ]);
  const adoptionsRepository = new FakeAdoptionsRepository();
  const service = new AdoptionsService({
    usersRepository,
    petsRepository,
    adoptionsRepository,
  });
  return { service, usersRepository, petsRepository, adoptionsRepository };
};

// Flujo exitoso.
{
  const context = buildService();
  const adoption = await context.service.create({ userId: IDS.user, petId: IDS.pet });
  assert.equal(adoption.owner, IDS.user);
  assert.equal(adoption.pet, IDS.pet);
  assert.deepEqual((await context.usersRepository.getById(IDS.user)).pets, [IDS.pet]);
  assert.deepEqual(await context.petsRepository.getById(IDS.pet), {
    _id: IDS.pet,
    adopted: true,
    owner: IDS.user,
  });
  assert.equal((await context.service.getAll()).length, 1);
  assert.equal((await context.service.getById(adoption._id))._id, adoption._id);
}

// Recurso inexistente y mascota ya adoptada.
{
  const context = buildService();
  await assert.rejects(
    () => context.service.getById(IDS.missing),
    (error) => error.code === 'ADOPTION_NOT_FOUND' && error.statusCode === 404,
  );
  await assert.rejects(
    () => context.service.create({ userId: IDS.user, petId: IDS.adoptedPet }),
    (error) => error.code === 'PET_ALREADY_ADOPTED' && error.statusCode === 400,
  );
}

// Dos solicitudes simultáneas: solo una puede ganar.
{
  const context = buildService();
  const results = await Promise.allSettled([
    context.service.create({ userId: IDS.user, petId: IDS.pet }),
    context.service.create({ userId: IDS.user, petId: IDS.pet }),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  const rejected = results.find((result) => result.status === 'rejected');
  assert.equal(rejected.reason.code, 'PET_UPDATE_CONFLICT');
  assert.equal((await context.adoptionsRepository.getAll()).length, 1);
}

// Si falla el registro de adopción, usuario y mascota deben volver al estado inicial.
{
  const context = buildService();
  context.adoptionsRepository.create = async () => {
    throw new Error('simulated insert failure');
  };
  await assert.rejects(() =>
    context.service.create({ userId: IDS.user, petId: IDS.pet }),
  );
  assert.deepEqual((await context.usersRepository.getById(IDS.user)).pets, []);
  assert.deepEqual(await context.petsRepository.getById(IDS.pet), {
    _id: IDS.pet,
    adopted: false,
    owner: null,
  });
}

console.log('Core smoke test passed: success, validation, concurrency and rollback');
