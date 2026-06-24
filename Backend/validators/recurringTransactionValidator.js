const { z } = require('zod');

const recurringTransactionSchema = z.object({
  amount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().positive('Amount must be a positive number')
  ),
  description: z.string().trim().min(1, 'Description is required').max(150, 'Description cannot exceed 150 characters'),
  category: z.string().trim().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']).default('expense'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  startDate: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date().default(() => new Date())
  ),
  tags: z.array(z.string()).default([]),
  notes: z.string().trim().optional().default(''),
  isActive: z.boolean().default(true)
});

exports.validateRecurringTransaction = (req, res, next) => {
  if (req.body.title && !req.body.description) {
    req.body.description = req.body.title;
  }

  const result = recurringTransactionSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: errorMsg });
  }
  req.body = result.data;
  next();
};
