const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).default('user')
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

exports.validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: errorMsg });
  }
  req.body = result.data; // sanitised inputs
  next();
};

exports.validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: errorMsg });
  }
  req.body = result.data; // sanitised inputs
  next();
};
