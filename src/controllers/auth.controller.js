import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import UserModel from '../models/user.model.js';
import { generateToken } from '../config/jwt.js';
import AuthService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    return sendSuccess(res, 'User registered successfully.', user, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const result = await AuthService.login(userName, password);
    
    return sendSuccess(res, 'Login successful.', {
      token: result.token,
      user: {
        id: result.user.userId,
        name: result.user.name,
        role: result.user.roleName ? result.user.roleName.toUpperCase() : null
      }
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Logged out successfully.', null, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const profile = {
      id: user.userId,
      name: user.name,
      role: user.roleName ? user.roleName.toUpperCase() : null
    };
    return sendSuccess(res, 'Profile retrieved successfully.', profile);
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token missing or invalid format.', null, 401);
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch (err) {
      return sendError(res, 'Invalid token.', null, 401);
    }
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid token payload.', null, 401);
    }
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User not found.', null, 401);
    }
    if (user.status !== 'Active') {
      return sendError(res, 'User account is inactive.', null, 401);
    }
    const newToken = generateToken({ userId: user.userId, name: user.name, role: user.roleName });
    return sendSuccess(res, 'Token refreshed successfully.', { token: newToken }, 200);
  } catch (error) {
    next(error);
  }
};
