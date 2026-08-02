import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';

export const createAdoptionRouter = (controller) => {
  if (!controller) throw new Error('adoptionsController is required');

  const router = Router();
  router.get('/', asyncHandler(controller.getAll));
  router.get('/:aid', asyncHandler(controller.getById));
  router.post('/:uid/:pid', asyncHandler(controller.create));
  return router;
};
