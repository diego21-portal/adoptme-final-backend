import { createApp } from '../src/app.js';
import { AdoptionsController } from '../src/controllers/adoptions.controller.js';
import { AdoptionsService } from '../src/services/adoptions.service.js';
import {
  FakeAdoptionsRepository,
  FakePetsRepository,
  FakeUsersRepository,
} from './fakes/in-memory-repositories.js';

export const IDS = Object.freeze({
  user: '64b000000000000000000001',
  otherUser: '64b000000000000000000002',
  missingUser: '64b000000000000000000099',
  pet: '64b000000000000000000011',
  adoptedPet: '64b000000000000000000012',
  missingPet: '64b000000000000000000098',
  adoption: '64b000000000000000000021',
  missingAdoption: '64b000000000000000000097',
  existingOwner: '64b000000000000000000002',
});

export const buildTestContext = (overrides = {}) => {
  const usersRepository =
    overrides.usersRepository ??
    new FakeUsersRepository([
      { _id: IDS.user, first_name: 'Ana', pets: [] },
      { _id: IDS.otherUser, first_name: 'Luis', pets: [IDS.adoptedPet] },
    ]);

  const petsRepository =
    overrides.petsRepository ??
    new FakePetsRepository([
      { _id: IDS.pet, name: 'Luna', adopted: false, owner: null },
      {
        _id: IDS.adoptedPet,
        name: 'Milo',
        adopted: true,
        owner: IDS.otherUser,
      },
    ]);

  const adoptionsRepository =
    overrides.adoptionsRepository ??
    new FakeAdoptionsRepository([
      { _id: IDS.adoption, owner: IDS.otherUser, pet: IDS.adoptedPet },
    ]);

  const service = new AdoptionsService({
    usersRepository,
    petsRepository,
    adoptionsRepository,
  });
  const controller = new AdoptionsController(service);
  const app = createApp({ adoptionsController: controller });

  return {
    app,
    service,
    usersRepository,
    petsRepository,
    adoptionsRepository,
  };
};
