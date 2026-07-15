import UserModel from '../models/user.model.js';
import AuthService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    return sendSuccess(res, 'Users retrieved successfully.', users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found.', null, 404);
    }
    return sendSuccess(res, 'User retrieved successfully.', user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    return sendSuccess(res, 'User created successfully.', user, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if being updated
    if (updateData.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.default.hash(updateData.password, 10);
    }

    // Resolve role or roleName to roleId
    const roleNameInput = updateData.role || updateData.roleName;
    if (roleNameInput) {
      const roleId = await UserModel.getRoleIdByName(roleNameInput);
      if (!roleId) {
        return sendError(res, 'Invalid role name provided.', null, 400);
      }
      updateData.roleId = roleId;
    }

    // Strip unmappable fields from Users table update payload
    delete updateData.role;
    delete updateData.roleName;
    delete updateData.userId;

    const user = await UserModel.update(req.params.id, updateData);
    if (!user) {
      return sendError(res, 'User not found.', null, 404);
    }
    
    const updatedUser = await UserModel.findById(user.userId);
    const { password: _, ...result } = updatedUser;
    
    return sendSuccess(res, 'User updated successfully.', result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await UserModel.delete(req.params.id);
    if (!user) {
      return sendError(res, 'User not found.', null, 404);
    }
    return sendSuccess(res, 'User deleted successfully.', user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userName, newPassword } = req.body;
    
    await AuthService.changePassword(userName, newPassword);
    return sendSuccess(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};
