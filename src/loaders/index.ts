import express from 'express';
import logger from '../logger';
import expressLoader from './express';
import mongoClient from './mongodb';

export default async (app: express.Application) => {
  await mongoClient;
  logger.info('✌️ MONGODB loaded and connected!');

  expressLoader(app);
};
