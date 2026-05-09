/**
 * @file app/api/payments/create-intent/route.ts
 * POST /api/payments/create-intent
 *
 * Creates a Stripe PaymentIntent for a confirmed booking and saves
 * the paymentIntentId on the booking document.
 *
 * Flow:
 *   1. Validate session & booking ownership
 *   2. Guard: booking must be in "confirmed" status
 *   3. Create (or reuse) a Stripe PaymentIntent
 *   4. Persist paymentIntentId + set paymentStatus = "pending"
 *   5. Return { clientSecret } to the frontend
 */

import "@/models";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking.model";
import { ApiError } from "@/lib/api-error";

// Initialise Stripe — key is only ever used server-side
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ success: false, message: "bookingId is required" }, { status: 400 });
    }

    await connectDB();

    // 2. Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // 3. Ownership check — only the booking owner can pay
    if (booking.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 4. Status guard — must be "confirmed" to proceed to payment
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message: `Booking must be confirmed before payment. Current status: "${booking.status}"`,
        },
        { status: 409 }
      );
    }

    // 5. Reuse existing PaymentIntent if already created (idempotency)
    if (booking.paymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

      // If already succeeded, don't create another
      if (existing.status === "succeeded") {
        return NextResponse.json(
          { success: false, message: "This booking has already been paid." },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        clientSecret: existing.client_secret,
      });
    }

    // 6. Create new PaymentIntent
    //    amount is in the smallest currency unit (cents for USD, piastres for EGP, etc.)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100), // e.g. $25.00 → 2500
      currency: process.env.STRIPE_CURRENCY ?? "usd",
      metadata: {
        bookingId:  booking._id.toString(),
        userId:     session.user.id,
        providerId: booking.providerId.toString(),
        serviceId:  booking.serviceId.toString(),
      },
      // Optional: pre-fill email for Stripe receipts
      receipt_email: session.user.email ?? undefined,
    });

    // 7. Persist intent ID and mark payment as pending
    booking.paymentIntentId = paymentIntent.id;
    booking.paymentStatus   = "pending";
    await booking.save();

    return NextResponse.json({
      success:      true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    if (error instanceof Stripe.errors.StripeError) {
      console.error("[POST /api/payments/create-intent] Stripe error:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 402 });
    }
    console.error("[POST /api/payments/create-intent]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}