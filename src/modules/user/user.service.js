import { getReadUser, getWriteUser } from '../auth/auth.model.js';
import CustomError from '../../utils/customError.util.js';

class UserService {
  async getMe(userId) {
    const UserRead = getReadUser();
    const user = await UserRead.findById(userId);
    if (!user) throw new CustomError('User not found', 404);
    return user;
  }

  async updateProfile(userId, data) {
    const UserWrite = getWriteUser();
    const updateData = {};
    if (data.phone) updateData.phone = data.phone;
    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;

    const user = await UserWrite.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) throw new CustomError("User not found", 404);
    return user;
  }
}

export default new UserService();
