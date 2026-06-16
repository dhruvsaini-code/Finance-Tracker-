const authService = require('../services/authService');

// Helper to set httpOnly cookie for refresh token
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  res.cookie('refreshToken', token, cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const result = await authService.register(username, email, password);

    // Set refresh token in cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      token: result.accessToken, // access token
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token in cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      token: result.accessToken, // access token
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res, next) => {
  try {
    // Read from cookies or request body
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const result = await authService.refresh(token);

    // Set new refresh token in cookie (rotation)
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      token: result.accessToken,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// @desc    Log user out / Clear session
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // req.user was populated in protect middleware
    if (req.user) {
      await authService.logout(req.user._id);
    }

    // Clear client cookies
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
