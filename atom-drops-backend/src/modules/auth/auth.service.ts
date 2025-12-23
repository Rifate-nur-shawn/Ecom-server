import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const prisma = new PrismaClient();

// Helper to sign JWT
const signToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

export const registerUser = async (email: string, password: string) => {
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
    },
  });

  // 4. Generate Token
  const token = signToken(user.id, user.role);
  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  // 1. Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // 2. Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // 3. Generate Token
  const token = signToken(user.id, user.role);
  return { user, token };
};