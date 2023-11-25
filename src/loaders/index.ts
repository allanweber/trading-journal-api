import express from 'express';
import logger from '../logger';
import expressLoader from './express';

export default async (app: express.Application) => {
  //   await mongooseLoader()
  logger.info('✌️ MONGODB loaded and connected!');

  expressLoader(app);
};
