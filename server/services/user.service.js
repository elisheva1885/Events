const userRepository = require('../repositories/user.repository');

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateUserProfile(userId, updateData) {
    const { password, role, ...allowedUpdates } = updateData;

    const updatedUser = await userRepository.update(userId, allowedUpdates);
    
    if (!updatedUser) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword;
  }
}

module.exports = new UserService();