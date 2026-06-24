const { z } = require('zod');

const savingsGoalSchema = z.object({
  title: z.string().trim().min(1, 'Goal title is required').max(100, 'Title cannot exceed 100 characters'),
  targetAmount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().positive('Target amount must be a positive number')
  ),
  currentAmount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().nonnegative('Current amount must be a non-negative number').default(0)
  ),
  deadline: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date({ required_error: 'A valid target deadline date is required' })
  )
});

exports.validateSavingsGoal = (req, res, next) => {
  const result = savingsGoalSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: errorMsg });
  }
  req.body = result.data;
  next();
};
