import express from 'express';
import morgan from 'morgan';
import config from './config';
import loaders from './loaders';
import logger from './logger';

async function startServer() {
  const app = express();
  app.use(
    morgan(
      ':date[iso] :remote-addr [:method:url] :status :res[content-length] bytes - :response-time ms [:user-agent]'
    )
  );
  await loaders(app);

  app
    .listen(config.port, () => {
      logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });
}

startServer();
