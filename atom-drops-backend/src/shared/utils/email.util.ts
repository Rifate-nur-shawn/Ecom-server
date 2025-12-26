// Email utility for sending transactional emails
// Note: Install nodemailer with: npm install nodemailer @types/nodemailer

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // TODO: Configure nodemailer transport in production
  // For now, just log the email
  console.log("📧 Email would be sent:", {
    to: options.to,
    subject: options.subject,
  });

  // Production example:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: options.to,
  //   subject: options.subject,
  //   html: options.html,
  // });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p>Order ID: ${orderDetails.id}</p>
    <p>Total: ${orderDetails.total_amount / 100} BDT</p>
    <p>Status: ${orderDetails.status}</p>
  `;

  await sendEmail({
    to: email,
    subject: "Order Confirmation - Atom Drops",
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Password Reset - Atom Drops",
    html,
  });
};

export const sendPaymentSuccessEmail = async (
  email: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h1>Payment Successful</h1>
    <p>Your payment has been processed successfully!</p>
    <p>Order ID: ${orderDetails.id}</p>
    <p>Amount Paid: ${orderDetails.total_amount / 100} BDT</p>
    <p>We'll send you another email when your order ships.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Payment Successful - Atom Drops",
    html,
  });
};
