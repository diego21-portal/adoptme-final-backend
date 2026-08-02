import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specie: { type: String, required: true, trim: true },
    birthDate: { type: Date, default: null },
    adopted: { type: Boolean, default: false, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false },
);

petSchema.index({ _id: 1, adopted: 1, owner: 1 });

export const PetModel = mongoose.model('Pet', petSchema);
