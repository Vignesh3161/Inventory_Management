import { sendError } from '../utils/response.js';

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleName) {
      return sendError(res, 'Access denied. Role not recognized.', null, 403);
    }
    
    const normalizeRole = (role) => role.toUpperCase().replace(/\s+/g, '_').replace(/_+/g, '_').trim();
    
    const userRoleNormalized = normalizeRole(req.user.roleName);
    const rolesArray = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
      .map(role => normalizeRole(role));

    if (!rolesArray.includes(userRoleNormalized)) {
      return sendError(res, 'Access denied. You do not have the required permissions.', null, 403);
    }
    next();
  };
};
