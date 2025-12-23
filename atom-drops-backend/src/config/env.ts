import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Add these new lines:
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

// Validate the environment
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;