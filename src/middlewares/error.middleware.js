import { ApiError } from '../utils/api-error.js';

export const notFoundHandler = (req, _res, next) => {
  next(
    new ApiError(
      404,
      `Route ${req.method} ${req.originalUrl} not found`,
      undefined,
      'ROUTE_NOT_FOUND',
    ),
  );
};

export const errorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    const payload = {
      status: 'error',
      error: {
        code: error.code,
        message: error.message,
      },
    };
    if (error.details !== undefined) {
      payload.error.details = error.details;
    }
    res.status(error.statusCode).json(payload);
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(500).json({
    status: 'error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
};
