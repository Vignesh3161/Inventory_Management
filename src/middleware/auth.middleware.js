import { verifyToken } from '../config/jwt.js';
import UserModel from '../models/user.model.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format.', null, 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired token.', null, 401);
    }
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User not found.', null, 401);
    }
    if (user.status !== 'Active') {
      return sendError(res, 'User account is inactive.', null, 401);
    }
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication error.', error, 401);
  }
};
