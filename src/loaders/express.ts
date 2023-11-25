import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import config from '../config';
import routes from '../routes';

export default (app: express.Application) => {
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' }).end();
  });
  app.head('/health', (req, res) => {
    res.status(200).end();
  });

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    morgan(
      ':date[iso] :remote-addr [:method:url] :status :res[content-length] bytes - :response-time ms [:user-agent]'
    )
  );

  app.use(config.api.prefix, routes());

  //TODO: Search about errorHandler/Listeners

  //Not found
  app.get('**', (req, res) => {
    res.status(404).send('Not Found!!!');
  });
};
