import dotenv from 'dotenv';

dotenv.config();

export const env = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'secret',
  DB_NAME: process.env.DB_NAME || 'test',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
