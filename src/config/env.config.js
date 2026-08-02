import 'dotenv/config';

const parsePort = (value) => {
  const port = Number(value ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  return port;
};

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017',
  dbName: process.env.DB_NAME ?? 'adoptme',
});
