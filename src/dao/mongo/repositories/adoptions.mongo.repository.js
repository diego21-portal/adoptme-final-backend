export class AdoptionsMongoRepository {
  constructor(model) {
    if (!model) throw new Error('Adoption model is required');
    this.model = model;
  }

  getAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  getById(id) {
    return this.model.findById(id).lean();
  }

  async create(data) {
    const adoption = await this.model.create(data);
    return adoption.toObject();
  }
}
