import mongoose from 'mongoose';
import { env } from '../src/config/env.config.js';
import { UserModel } from '../src/dao/mongo/models/user.model.js';
import { PetModel } from '../src/dao/mongo/models/pet.model.js';
import { AdoptionModel } from '../src/dao/mongo/models/adoption.model.js';

const uri = `${env.mongoUrl.replace(/\/$/, '')}/${env.dbName}`;

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all([
    AdoptionModel.deleteMany({}),
    UserModel.deleteMany({}),
    PetModel.deleteMany({}),
  ]);

  const [ana, luis] = await UserModel.create([
    {
      first_name: 'Ana',
      last_name: 'Gómez',
      email: 'ana@example.com',
      pets: [],
    },
    {
      first_name: 'Luis',
      last_name: 'Pérez',
      email: 'luis@example.com',
      pets: [],
    },
  ]);

  const [luna, milo] = await PetModel.create([
    { name: 'Luna', specie: 'dog', adopted: false, owner: null },
    { name: 'Milo', specie: 'cat', adopted: true, owner: luis._id },
  ]);
  await UserModel.findByIdAndUpdate(luis._id, { $addToSet: { pets: milo._id } });
  await AdoptionModel.create({ owner: luis._id, pet: milo._id });

  console.log('Seed completed');
  console.log({
    availableUserId: ana._id.toString(),
    availablePetId: luna._id.toString(),
    adoptedUserId: luis._id.toString(),
    adoptedPetId: milo._id.toString(),
  });
} finally {
  await mongoose.disconnect();
}
