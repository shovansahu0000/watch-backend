import { getReadUser, getWriteUser } from '../auth/auth.model.js';
import CustomError from '../../utils/customError.util.js';

class UserService {
  async getProfile(userId) {
    const UserRead = getReadUser();
    const user = await UserRead.findById(userId);
    if (!user) throw new CustomError('User not found', 404);
    return user;
  }

  async addAddress(userId, addressData) {
    const UserWrite = getWriteUser();
    const user = await UserWrite.findByIdAndUpdate(
      userId,
      { $push: { addresses: addressData } },
      { new: true }
    );
    if (!user) throw new CustomError('User not found', 404);
    return user;
  }
}

export default new UserService();
