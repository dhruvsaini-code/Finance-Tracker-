const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_finance_tracker_key_123456';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_987654';

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(username, email, password) {
    // Check if user exists
    const userByEmail = await userRepository.findByEmail(email);
    if (userByEmail) {
      throw new Error('User with this email already exists');
    }

    const userByUsername = await userRepository.findByUsername(username);
    if (userByUsername) {
      throw new Error('User with this username already exists');
    }

    // Create user
    const user = await userRepository.create({
      username,
      email,
      password
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to database
    await userRepository.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to database
    await userRepository.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async logout(userId) {
    // Invalidate refresh token in database
    await userRepository.updateRefreshToken(userId, null);
    return { success: true };
  }

  async refresh(token) {
    try {
      // Decode and verify refresh token
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      
      const user = await userRepository.findByRefreshToken(token);
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Rotate refresh token
      await userRepository.updateRefreshToken(user._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error('Token verification failed: ' + error.message);
    }
  }
}

module.exports = new AuthService();
