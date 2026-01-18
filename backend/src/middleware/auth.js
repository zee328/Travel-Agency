import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const issuer = process.env.JWT_ISSUER;
const audience = process.env.JWT_AUDIENCE;
const jwksUri = process.env.JWKS_URI;

let client = null;
if (jwksUri) {
  client = jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });
}

function getKey(header, callback) {
  if (!client) return callback(new Error('JWKS client not configured'));
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export function requireAuth(req, res, next) {
  if (!issuer || !audience || !jwksUri) {
    return res.status(500).json({ error: 'Authentication not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = authHeader.slice('Bearer '.length);

  jwt.verify(token, getKey, {
    audience,
    issuer,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}
