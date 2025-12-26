import { prisma } from "../../config/prisma.client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../config/env";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { sendPasswordResetEmail } from "../../shared/utils/email.util";

// Helper to sign JWT
const signToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

export const registerUser = async (email: string, password: string) => {
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError("User already exists");
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
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      created_at: true,
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
    throw new UnauthorizedError("Invalid credentials");
  }

  // 2. Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // 3. Generate Token
  const token = signToken(user.id, user.role);

  // Return user without password
  const { password_hash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists or not for security
    return {
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Delete any existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { user_id: user.id },
  });

  // Create new reset token (expires in 1 hour)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordResetToken.create({
    data: {
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
    },
  });

  // Send email with reset token
  await sendPasswordResetEmail(email, resetToken);

  return {
    message:
      "If an account exists with this email, you will receive a password reset link.",
  };
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find valid token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!resetToken) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  // Check if token is expired
  if (resetToken.expires_at < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    throw new BadRequestError("Reset token has expired");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update password and delete reset token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.user_id },
      data: { password_hash: passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ]);

  return { message: "Password reset successfully" };
};

// Get current user profile
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      created_at: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          addresses: true,
        },
      },
    },
  });

  if (!user) throw new NotFoundError("User not found");
  return user;
};

// Update profile
export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
    },
  });
};
