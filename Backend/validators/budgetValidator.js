const { z } = require('zod');

const budgetSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  limitAmount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().positive('Limit amount must be a positive number')
  ),
  month: z.string().trim().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});

exports.validateBudget = (req, res, next) => {
  const result = budgetSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: errorMsg });
  }
  req.body = result.data;
  next();
};
