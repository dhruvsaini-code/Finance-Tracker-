const { z } = require('zod');

const envSchema = z.object({
  PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().default(5050)),
  MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB connection string'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET must be at least 8 characters').default('super_secret_refresh_key_987654'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENAI_API_KEY: z.string().optional()
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    result.error.errors.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  // Assign parsed and default values back to process.env
  Object.keys(result.data).forEach(key => {
    process.env[key] = String(result.data[key]);
  });
};

module.exports = validateEnv;
