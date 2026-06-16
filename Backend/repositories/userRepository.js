const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email });
    if (selectPassword) {
      query.select('+password');
    }
    return await query;
  }

  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    ).select('+refreshToken');
  }

  async findByRefreshToken(refreshToken) {
    return await User.findOne({ refreshToken }).select('+refreshToken');
  }
}

module.exports = new UserRepository();
