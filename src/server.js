import mongoose from 'mongoose';
import { env } from './config/env.config.js';
import { createApp } from './app.js';
import { AdoptionsController } from './controllers/adoptions.controller.js';
import { AdoptionsService } from './services/adoptions.service.js';
import { AdoptionModel } from './dao/mongo/models/adoption.model.js';
import { PetModel } from './dao/mongo/models/pet.model.js';
import { UserModel } from './dao/mongo/models/user.model.js';
import { AdoptionsMongoRepository } from './dao/mongo/repositories/adoptions.mongo.repository.js';
import { PetsMongoRepository } from './dao/mongo/repositories/pets.mongo.repository.js';
import { UsersMongoRepository } from './dao/mongo/repositories/users.mongo.repository.js';

const mongoConnectionString = `${env.mongoUrl.replace(/\/$/, '')}/${env.dbName}`;

const start = async () => {
  await mongoose.connect(mongoConnectionString, {
    serverSelectionTimeoutMS: 10000,
  });

  const service = new AdoptionsService({
    usersRepository: new UsersMongoRepository(UserModel),
    petsRepository: new PetsMongoRepository(PetModel),
    adoptionsRepository: new AdoptionsMongoRepository(AdoptionModel),
  });
  const app = createApp({ adoptionsController: new AdoptionsController(service) });

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`AdoptMe API listening on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((error) => {
  console.error('Application startup failed', error);
  process.exit(1);
});
