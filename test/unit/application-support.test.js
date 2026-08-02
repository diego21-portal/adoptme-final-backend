import { expect } from 'chai';
import sinon from 'sinon';
import { createApp } from '../../src/app.js';
import { ApiError } from '../../src/utils/api-error.js';
import { errorHandler } from '../../src/middlewares/error.middleware.js';
import { asyncHandler } from '../../src/utils/async-handler.js';
import { isValidObjectId } from '../../src/utils/object-id.js';
import { AdoptionsService } from '../../src/services/adoptions.service.js';

process.env.NODE_ENV = 'test';

describe('Soporte de aplicación y middleware de errores', () => {
  afterEach(() => {
    sinon.restore();
    process.env.NODE_ENV = 'test';
  });

  it('exige el controlador de adopciones al construir la aplicación', () => {
    expect(() => createApp({})).to.throw('adoptionsController is required');
  });

  it('exige todos los repositorios al construir el servicio', () => {
    expect(() => new AdoptionsService({})).to.throw('All repositories are required');
  });

  it('delega al siguiente middleware cuando los headers ya fueron enviados', () => {
    const error = new Error('late error');
    const next = sinon.spy();
    errorHandler(error, {}, { headersSent: true }, next);
    expect(next.calledOnceWithExactly(error)).to.equal(true);
  });

  it('incluye detalles controlados de un ApiError', () => {
    const error = new ApiError(
      422,
      'Validation failed',
      { field: 'email' },
      'VALIDATION_ERROR',
    );
    const res = {
      headersSent: false,
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    errorHandler(error, {}, res, sinon.spy());

    expect(res.status.calledOnceWithExactly(422)).to.equal(true);
    expect(
      res.json.calledOnceWithExactly({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { field: 'email' },
        },
      }),
    ).to.equal(true);
  });

  it('registra errores internos fuera de test y oculta el mensaje', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('database password leaked');
    const consoleStub = sinon.stub(console, 'error');
    const res = {
      headersSent: false,
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    errorHandler(error, {}, res, sinon.spy());

    expect(consoleStub.calledOnceWithExactly(error)).to.equal(true);
    expect(res.status.calledOnceWithExactly(500)).to.equal(true);
    expect(
      res.json.calledOnceWithExactly({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      }),
    ).to.equal(true);
  });

  it('reconoce ObjectId válidos e inválidos', () => {
    expect(isValidObjectId('64b000000000000000000001')).to.equal(true);
    expect(isValidObjectId('not-valid')).to.equal(false);
    expect(isValidObjectId(null)).to.equal(false);
  });

  it('reenvía rechazos de handlers asincrónicos', async () => {
    const error = new Error('async failure');
    const next = sinon.spy();
    asyncHandler(async () => {
      throw error;
    })({}, {}, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(next.calledOnceWithExactly(error)).to.equal(true);
  });
});
