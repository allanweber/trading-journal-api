import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import config from '../config';
import logger from '../logger';

export const protectRoute = async (req, res, next) => {
  const client = jwksClient({
    jwksUri: `${config.issuer}/.well-known/jwks.json`,
  });
  function getKey(header, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.getSigningKey(header.kid, function (err, key: any) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  const options = {
    issuer: config.issuer,
  };

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    logger.info('token =>' + token);
    if (!token) {
      console.error('Token not found!');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, getKey, options, function (err, decoded: JwtPayload) {
      if (err) {
        console.error('jwt.verify Error', err);
        return res.sendStatus(401);
      }
      logger.info('decoded =>' + JSON.stringify(decoded));
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
