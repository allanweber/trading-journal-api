import express from 'express';
import expressLoader from './express';
import seed from './seed';

export default async (app: express.Application) => {
  expressLoader(app);
  await seed();
};
