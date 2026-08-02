const clone = (value) => (value === undefined ? undefined : structuredClone(value));

export class FakeUsersRepository {
  constructor(users = []) {
    this.users = new Map(users.map((user) => [user._id, clone(user)]));
  }

  async getById(id) {
    const user = this.users.get(id);
    return user ? clone(user) : null;
  }

  async addPet(userId, petId) {
    const user = this.users.get(userId);
    if (!user) return null;
    if (!user.pets.includes(petId)) user.pets.push(petId);
    return clone(user);
  }

  async removePet(userId, petId) {
    const user = this.users.get(userId);
    if (!user) return null;
    user.pets = user.pets.filter((id) => id !== petId);
    return clone(user);
  }
}

export class FakePetsRepository {
  constructor(pets = []) {
    this.pets = new Map(pets.map((pet) => [pet._id, clone(pet)]));
  }

  async getById(id) {
    const pet = this.pets.get(id);
    return pet ? clone(pet) : null;
  }

  async claimForAdoption(petId, ownerId) {
    const pet = this.pets.get(petId);
    if (!pet || pet.adopted || pet.owner) return null;
    pet.adopted = true;
    pet.owner = ownerId;
    return clone(pet);
  }

  async releaseIfOwnedBy(petId, ownerId) {
    const pet = this.pets.get(petId);
    if (!pet || pet.owner !== ownerId) return null;
    pet.adopted = false;
    pet.owner = null;
    return clone(pet);
  }
}

export class FakeAdoptionsRepository {
  constructor(adoptions = []) {
    this.adoptions = new Map(
      adoptions.map((adoption) => [adoption._id, clone(adoption)]),
    );
    this.sequence = adoptions.length;
  }

  async getAll() {
    return [...this.adoptions.values()].map(clone);
  }

  async getById(id) {
    const adoption = this.adoptions.get(id);
    return adoption ? clone(adoption) : null;
  }

  async create(data) {
    this.sequence += 1;
    const id = this.sequence.toString(16).padStart(24, '0').slice(-24);
    const adoption = { _id: id, ...clone(data) };
    this.adoptions.set(id, adoption);
    return clone(adoption);
  }
}
