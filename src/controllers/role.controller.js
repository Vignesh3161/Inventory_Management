import RoleModel from '../models/role.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createRole = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    
    const existingRole = await RoleModel.findByName(roleName);
    if (existingRole) {
      return sendError(res, 'Role already exists.', null, 400);
    }
    
    const role = await RoleModel.create(roleName);
    return sendSuccess(res, 'Role created successfully.', role, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await RoleModel.findAll();
    return sendSuccess(res, 'Roles retrieved successfully.', roles);
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = await RoleModel.findById(req.params.id);
    if (!role) {
      return sendError(res, 'Role not found.', null, 404);
    }
    return sendSuccess(res, 'Role retrieved successfully.', role);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    const existingRole = await RoleModel.findByName(roleName);
    if (existingRole && existingRole.roleId !== parseInt(req.params.id)) {
      return sendError(res, 'Role name already exists.', null, 400);
    }
    const role = await RoleModel.update(req.params.id, roleName);
    if (!role) {
      return sendError(res, 'Role not found.', null, 404);
    }
    return sendSuccess(res, 'Role updated successfully.', role);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = await RoleModel.delete(req.params.id);
    if (!role) {
      return sendError(res, 'Role not found.', null, 404);
    }
    return sendSuccess(res, 'Role deleted successfully.', role);
  } catch (error) {
    next(error);
  }
};
