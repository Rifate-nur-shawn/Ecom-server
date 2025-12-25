import { PrismaClient } from "@prisma/client";
// import axios from 'axios';
// import { env } from '../../config/env';

const prisma = new PrismaClient();

// TODO: When integrating real bKash API, add these to .env file:
// BKASH_USERNAME, BKASH_PASSWORD, BKASH_APP_KEY, BKASH_SECRET

export const initiatePayment = async (userId: string, orderId: string) => {
  // 1. Get the Order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.user_id !== userId) throw new Error("Unauthorized");
  if (order.status === "PAID") throw new Error("Order already paid");

  // 2. Prepare bKash Payload
  // NOTE: In a real app, you would call bKash's Grant Token API first.
  // For this tutorial, we simulate the "Create Payment" call.

  // const amount = (order.total_amount / 100).toFixed(2); // Convert cents to Taka

  try {
    // REAL BKASH API CALL WOULD GO HERE
    // const { data } = await axios.post('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create', { ... })

    // 3. MOCK RESPONSE (For testing without credentials)
    const paymentID = `BKASH_${Math.floor(Math.random() * 1000000)}`;

    // 4. Save Payment Record in DB
    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: order.total_amount,
        transaction_id: paymentID,
        status: "PENDING",
        provider: "bkash",
      },
    });

    // Return the URL the frontend should redirect to (Simulated)
    return {
      paymentID,
      bkashURL: `http://localhost:5000/api/v1/payments/mock-bkash-page?paymentID=${paymentID}`,
    };
  } catch (error) {
    throw new Error("Payment initiation failed");
  }
};

export const executePayment = async (paymentID: string) => {
  // 1. Find the local payment record
  const payment = await prisma.payment.findFirst({
    where: { transaction_id: paymentID },
    include: { order: true },
  });

  if (!payment) throw new Error("Invalid Payment ID");
  if (payment.status === "SUCCESS") return payment; // Idempotency (Prevent double processing)

  // 2. Verify with bKash (Mocking the verification)
  // In production: await axios.post('/execute', { paymentID })

  // 3. Update Database (Atomic Transaction)
  const result = await prisma.$transaction([
    // Update Payment Status
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS" },
    }),
    // Update Order Status
    prisma.order.update({
      where: { id: payment.order_id },
      data: { status: "PAID" },
    }),
  ]);

  return result;
};
