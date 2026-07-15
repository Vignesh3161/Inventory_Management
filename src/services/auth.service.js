import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model.js';
import { generateToken } from '../config/jwt.js';

class AuthService {
  static async getRoleIdFromRoleName(roleName) {
    return await UserModel.getRoleIdByName(roleName);
  }

  static async register({ name, password, role, roleName, roleId, phone, status }) {
    // Check for duplicate username
    const existingName = await UserModel.findByName(name);
    if (existingName) {
      throw new Error('Username already exists.');
    }

    // Resolve roleId
    let finalRoleId = roleId;
    const providedRole = role || roleName;
    if (!finalRoleId && providedRole) {
      finalRoleId = await this.getRoleIdFromRoleName(providedRole);
    }
    if (!finalRoleId) {
      throw new Error('Valid role or roleId is required.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      password: hashedPassword,
      roleId: finalRoleId,
      phone,
      status
    });

    // Retrieve user with role name populated
    const createdUser = await UserModel.findById(user.userId);
    const { password: _, ...result } = createdUser;
    return result;
  }

  static async login(userName, password) {
    const user = await UserModel.findByName(userName);

    if (!user) {
      throw new Error('Invalid username or password.');
    }
    if (user.status !== 'Active') {
      throw new Error('User account is inactive.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password.');
    }
    const token = generateToken({ userId: user.userId, name: user.name, role: user.roleName });
    const { password: _, ...userInfo } = user;
    return { user: userInfo, token };
  }

  static async changePassword(userName, newPassword) {
    const user = await UserModel.findByName(userName);
    if (!user) {
      throw new Error('User not found.');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.update(user.userId, { password: hashed });
    return true;
  }
}

export default AuthService;
