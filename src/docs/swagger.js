export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'AdoptMe API',
    version: '1.0.0',
    description: 'API REST de adopciones - entrega final Backend III.',
  },
  servers: [{ url: 'http://localhost:8080', description: 'Local / Docker' }],
  tags: [{ name: 'Adoptions', description: 'Operaciones de adopciones' }],
  paths: {
    '/api/adoptions': {
      get: {
        tags: ['Adoptions'],
        summary: 'Lista todas las adopciones',
        responses: {
          200: {
            description: 'Listado obtenido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Adoption' },
                    },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/adoptions/{aid}': {
      get: {
        tags: ['Adoptions'],
        summary: 'Obtiene una adopción por ID',
        parameters: [
          {
            name: 'aid',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          },
        ],
        responses: {
          200: {
            description: 'Adopción encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    payload: { $ref: '#/components/schemas/Adoption' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/adoptions/{uid}/{pid}': {
      post: {
        tags: ['Adoptions'],
        summary: 'Registra que un usuario adopta una mascota',
        parameters: [
          {
            name: 'uid',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          },
          {
            name: 'pid',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          },
        ],
        responses: {
          201: {
            description: 'Adopción creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Pet adopted' },
                    payload: { $ref: '#/components/schemas/Adoption' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
          409: {
            description: 'Conflicto de concurrencia: la mascota fue reclamada primero',
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    schemas: {
      Adoption: {
        type: 'object',
        required: ['_id', 'owner', 'pet'],
        properties: {
          _id: { type: 'string', example: '64b000000000000000000021' },
          owner: { type: 'string', example: '64b000000000000000000001' },
          pet: { type: 'string', example: '64b000000000000000000011' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'ADOPTION_NOT_FOUND' },
              message: { type: 'string', example: 'Adoption not found' },
              details: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'ID inválido o mascota ya adoptada',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      NotFound: {
        description: 'Recurso inexistente',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      InternalError: {
        description: 'Error interno sin exposición de detalles sensibles',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
  },
};
