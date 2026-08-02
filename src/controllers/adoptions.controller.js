import { ApiError } from '../utils/api-error.js';
import { isValidObjectId } from '../utils/object-id.js';

const assertObjectId = (value, { field, code, label }) => {
  if (!isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${label}`, { field }, code);
  }
};

export class AdoptionsController {
  constructor(service) {
    if (!service) throw new Error('adoptionsService is required');
    this.service = service;
  }

  getAll = async (_req, res) => {
    const adoptions = await this.service.getAll();
    res.status(200).json({ status: 'success', payload: adoptions });
  };

  getById = async (req, res) => {
    const { aid } = req.params;
    assertObjectId(aid, {
      field: 'aid',
      code: 'INVALID_ADOPTION_ID',
      label: 'adoption ID',
    });
    const adoption = await this.service.getById(aid);
    res.status(200).json({ status: 'success', payload: adoption });
  };

  create = async (req, res) => {
    const { uid, pid } = req.params;
    assertObjectId(uid, {
      field: 'uid',
      code: 'INVALID_USER_ID',
      label: 'user ID',
    });
    assertObjectId(pid, {
      field: 'pid',
      code: 'INVALID_PET_ID',
      label: 'pet ID',
    });

    const adoption = await this.service.create({ userId: uid, petId: pid });
    res.status(201).json({
      status: 'success',
      message: 'Pet adopted',
      payload: adoption,
    });
  };
}
