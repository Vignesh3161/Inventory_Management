import jwt from 'jsonwebtoken';
import env from './env.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiration });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
};
