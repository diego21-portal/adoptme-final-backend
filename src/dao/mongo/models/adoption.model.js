import mongoose from 'mongoose';

const adoptionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const AdoptionModel = mongoose.model('Adoption', adoptionSchema);
