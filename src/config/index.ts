import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  const envFound = dotenv.config();
  if (envFound.error) {
    throw new Error('⚠️  Could not find .env file  ⚠️');
  }
}

export default {
  port: process.env.PORT || 8080,

  databaseURL: process.env.MONGODB_URI,

  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },

  api: {
    prefix: '/api',
  },

  issuer: process.env.KINDE_DOMAIN,
};
