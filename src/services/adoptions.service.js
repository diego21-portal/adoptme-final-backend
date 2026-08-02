import { ApiError } from '../utils/api-error.js';

export class AdoptionsService {
  constructor({ usersRepository, petsRepository, adoptionsRepository }) {
    if (!usersRepository || !petsRepository || !adoptionsRepository) {
      throw new Error('All repositories are required');
    }
    this.usersRepository = usersRepository;
    this.petsRepository = petsRepository;
    this.adoptionsRepository = adoptionsRepository;
  }

  async getAll() {
    return this.adoptionsRepository.getAll();
  }

  async getById(adoptionId) {
    const adoption = await this.adoptionsRepository.getById(adoptionId);
    if (!adoption) {
      throw new ApiError(404, 'Adoption not found', undefined, 'ADOPTION_NOT_FOUND');
    }
    return adoption;
  }

  async create({ userId, petId }) {
    const [user, pet] = await Promise.all([
      this.usersRepository.getById(userId),
      this.petsRepository.getById(petId),
    ]);

    if (!user) {
      throw new ApiError(404, 'User not found', undefined, 'USER_NOT_FOUND');
    }
    if (!pet) {
      throw new ApiError(404, 'Pet not found', undefined, 'PET_NOT_FOUND');
    }
    if (pet.adopted || pet.owner) {
      const sameUserOwnsPet =
        pet.owner && String(pet.owner) === String(userId);

      if (sameUserOwnsPet) {
        throw new ApiError(
          409,
          'Pet was adopted by another request',
          undefined,
          'PET_UPDATE_CONFLICT',
        );
      }

      throw new ApiError(
        400,
        'Pet is already adopted',
        undefined,
        'PET_ALREADY_ADOPTED',
      );
    }

    const claimedPet = await this.petsRepository.claimForAdoption(petId, userId);
    if (!claimedPet) {
      throw new ApiError(
        409,
        'Pet was adopted by another request',
        undefined,
        'PET_UPDATE_CONFLICT',
      );
    }

    let userUpdated = false;
    try {
      const updatedUser = await this.usersRepository.addPet(userId, petId);
      if (!updatedUser) {
        await this.#safeReleasePet(petId, userId);
        throw new ApiError(404, 'User not found', undefined, 'USER_NOT_FOUND');
      }
      userUpdated = true;

      return await this.adoptionsRepository.create({
        owner: userId,
        pet: petId,
      });
    } catch (error) {
      if (userUpdated) {
        await this.#safeRemovePet(userId, petId);
      }
      await this.#safeReleasePet(petId, userId);
      throw error;
    }
  }

  async #safeRemovePet(userId, petId) {
    try {
      await this.usersRepository.removePet(userId, petId);
    } catch (rollbackError) {
      this.#logRollbackError('user rollback failed', rollbackError);
    }
  }

  async #safeReleasePet(petId, userId) {
    try {
      await this.petsRepository.releaseIfOwnedBy(petId, userId);
    } catch (rollbackError) {
      this.#logRollbackError('pet rollback failed', rollbackError);
    }
  }

  #logRollbackError(message, error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(message, error);
    }
  }
}
