export class UsersMongoRepository {
  constructor(model) {
    if (!model) throw new Error('User model is required');
    this.model = model;
  }

  getById(id) {
    return this.model.findById(id).lean();
  }

  addPet(userId, petId) {
    return this.model
      .findByIdAndUpdate(userId, { $addToSet: { pets: petId } }, { new: true })
      .lean();
  }

  removePet(userId, petId) {
    return this.model
      .findByIdAndUpdate(userId, { $pull: { pets: petId } }, { new: true })
      .lean();
  }
}
