export class PetsMongoRepository {
  constructor(model) {
    if (!model) throw new Error('Pet model is required');
    this.model = model;
  }

  getById(id) {
    return this.model.findById(id).lean();
  }

  claimForAdoption(petId, ownerId) {
    return this.model
      .findOneAndUpdate(
        { _id: petId, adopted: false, owner: null },
        { $set: { adopted: true, owner: ownerId } },
        { new: true },
      )
      .lean();
  }

  releaseIfOwnedBy(petId, ownerId) {
    return this.model
      .findOneAndUpdate(
        { _id: petId, owner: ownerId },
        { $set: { adopted: false, owner: null } },
        { new: true },
      )
      .lean();
  }
}
