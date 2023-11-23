import { jwtVerify, setupKinde } from '@kinde-oss/kinde-node-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
const app = express();
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const config = {
  clientId: process.env.KINDE_CLIENT_ID,
  issuerBaseUrl: process.env.KINDE_DOMAIN,
  siteUrl: process.env.KINDE_SITE_URL,
  secret: process.env.KINDE_CLIENT_SECRET,
  redirectUrl: process.env.KINDE_SITE_URL,
};

setupKinde(config, app);

const verifier = jwtVerify(config.issuerBaseUrl);

app.get('/api', [verifier], async (req: Request, res: Response) => {
  // console.log('req.user', req);
  const journals = [
    {
      name: 'SP500',
      description: 'INDEXSP: .INX',
      currency: 'USD',
      startDate: new Date('2023-01-19T00:00:00.000Z'),
      startBalance: 10000,
      balance: {
        current: 12678.89,
      },
    },
    {
      name: 'AMEX1',
      description: 'Amsterdam journal',
      currency: 'EUR',
      startDate: new Date('2023-03-01T00:00:00.000Z'),
      startBalance: 9568.23,
      balance: {
        current: -1234.56,
      },
    },
    {
      name: 'WINW21',
      description: 'Bovespa journal',
      currency: 'BRL',
      startDate: new Date('2023-02-28T00:00:00.000Z'),
      startBalance: 9568.23,
      balance: {
        current: 7891.45,
      },
    },
  ];
  return res.status(200).json(journals);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
