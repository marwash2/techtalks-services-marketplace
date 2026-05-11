/**
 * @file app/api/payments/webhook/route.ts
 * POST /api/payments/webhook
 *
 * Stripe sends signed events here after payment succeeds or fails.
 * This is the ONLY place that marks a booking as paid/failed —
 * never trust the frontend for this.
 *
 * Events handled:
 *   - payment_intent.succeeded  → paymentStatus=paid, status=completed, paidAt=now
 *   - payment_intent.payment_failed → paymentStatus=failed
 *
 * Setup:
 *   1. Add STRIPE_WEBHOOK_SECRET to .env (from Stripe Dashboard → Webhooks)
 *   2. In Stripe Dashboard, point webhook to: https://yourdomain.com/api/payments/webhook
 *   3. Select events: payment_intent.succeeded, payment_intent.payment_failed
 */

import "@/models";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking.model";
import { createNotification } from "@/services/notification.service";
import { Provider } from "@/models/Provider.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  // ── Verify signature ───────────────────────────────────────────────────────
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {

    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;

      if (!bookingId) {
        console.warn("[Webhook] payment_intent.succeeded: no bookingId in metadata");
        break;
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.warn(`[Webhook] Booking ${bookingId} not found`);
        break;
      }

      // Idempotency: skip if already processed
      if (booking.paymentStatus === "paid") break;

      booking.paymentStatus = "paid";
      booking.status        = "completed";
      booking.paidAt        = new Date();
      await booking.save();

      // ── Notify user & provider ─────────────────────────────────────────────
      try {
        const notifyTasks = [
          createNotification({
            userId:  booking.userId.toString(),
            title:   "Payment Successful",
            message: `Your payment of $${(intent.amount / 100).toFixed(2)} was received. Booking is now complete.`,
            type:    "payment_success",
            link:    `/user/bookings/${bookingId}`,
          }),
        ];

        const providerDoc = await Provider.findById(booking.providerId).select("userId").lean() as { userId?: unknown } | null;
        if (providerDoc?.userId) {
          notifyTasks.push(
            createNotification({
              userId:  String(providerDoc.userId),
              title:   "Payment Received",
              message: `Payment received for booking on ${booking.date} at ${booking.time}.`,
              type:    "payment_success",
              link:    "/provider/bookings",
            })
          );
        }

        await Promise.all(notifyTasks);
      } catch (notifyErr) {
        console.error("[Webhook] Notification error:", notifyErr);
      }

      console.log(`[Webhook] ✅ Booking ${bookingId} marked as paid & completed`);
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;

      if (!bookingId) break;

      const booking = await Booking.findById(bookingId);
      if (!booking) break;

      booking.paymentStatus = "failed";
      await booking.save();

      // Notify user to retry
      try {
        await createNotification({
          userId:  booking.userId.toString(),
          title:   "Payment Failed",
          message: "Your payment was not successful. Please try again.",
          type:    "payment_failed",
          link:    `/bookings/${bookingId}/confirm`,
        });
      } catch (notifyErr) {
        console.error("[Webhook] Notification error:", notifyErr);
      }

      console.log(`[Webhook] ❌ Booking ${bookingId} payment failed`);
      break;
    }

    default:
      // Silently ignore events we don't handle
      break;
  }

  // Stripe expects a 200 quickly — always respond OK after processing
  return NextResponse.json({ received: true });
}