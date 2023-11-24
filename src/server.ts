import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const app = express();
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const config = {
  issuerBaseUrl: process.env.KINDE_DOMAIN,
};

const protectRoute = async (req, res, next) => {
  const client = jwksClient({
    jwksUri: `${config.issuerBaseUrl}/.well-known/jwks.json`,
  });
  function getKey(header, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.getSigningKey(header.kid, function (err, key: any) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  const options = {
    issuer: config.issuerBaseUrl,
  };

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.error('Token not found!');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, getKey, options, function (err, decoded: JwtPayload) {
      if (err) {
        console.error('jwt.verify Error', err);
        return res.sendStatus(401);
      }
      req.user = decoded['sub'];
      req.email = decoded['email'];

      next();
    });
  } catch (err) {
    console.error('Token not valid!');
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

interface AuthenticatedRequest extends Request {
  user?: string;
  email?: string;
}

app.get('/api', protectRoute, async (req: AuthenticatedRequest, res) => {
  console.log('req.user', req.user);
  console.log('req.email', req.email);

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
