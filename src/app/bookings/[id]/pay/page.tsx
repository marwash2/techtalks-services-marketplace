"use client";

/**
 * @file app/bookings/[id]/pay/page.tsx
 *
 * Payment page — shown after a provider confirms a booking.
 * Reached via: /bookings/{bookingId}/pay
 * Uses Stripe Elements (no raw card data ever touches your server).
 *
 * Install deps:
 *   npm install @stripe/stripe-js @stripe/react-stripe-js
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ── Stripe singleton ──────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookingSummary {
  id: string;
  date: string;
  time: string;
  price: number;
  status: string;
  paymentStatus: string;
  service?: { title: string };
  provider?: { businessName: string };
}

// ═════════════════════════════════════════════════════════════════════════════
// Inner checkout form
// ═════════════════════════════════════════════════════════════════════════════
function CheckoutForm({ booking }: { booking: BookingSummary }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/user/bookings/${booking.id}?payment=success`,
      },
    });

    // Only reaches here if payment fails immediately (not a redirect flow)
    if (error) {
      setErrorMsg(error.message ?? "Payment failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ${booking.price.toFixed(2)}
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe — your card details are never stored
      </p>
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════════════════════
export default function BookingPayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking,      setBooking]      = useState<BookingSummary | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pageError,    setPageError]    = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!id) return;

    async function init() {
      try {
        // 1. Fetch booking
        const bookingRes  = await fetch(`/api/bookings/${id}`);
        const bookingJson = await bookingRes.json();
        if (!bookingJson.success) throw new Error(bookingJson.message);

        const bk: BookingSummary = bookingJson.data;
        setBooking(bk);

        // 2. Guards
        if (bk.paymentStatus === "paid") {
          setPageError("This booking has already been paid.");
          return;
        }
        if (bk.status !== "confirmed") {
          setPageError("This booking is not ready for payment yet. Please wait for provider confirmation.");
          return;
        }

        // 3. Create / retrieve PaymentIntent
        const intentRes  = await fetch("/api/payments/create-intent", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ bookingId: id }),
        });
        const intentJson = await intentRes.json();
        if (!intentJson.success) throw new Error(intentJson.message);

        setClientSecret(intentJson.clientSecret);
      } catch (err: any) {
        setPageError(err.message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-wide">Loading payment…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Unable to load payment</h2>
          <p className="text-sm text-gray-500">{pageError}</p>
          <button
            onClick={() => router.push("/user/bookings")}
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!booking || !clientSecret) return null;

  const formattedDate = (() => {
    try {
      return new Date(booking.date).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    } catch {
      return booking.date;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-600">Booking Confirmed</span>
          </div>
          <div className="flex-1 h-px bg-blue-600 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</div>
            <span className="text-sm font-medium text-blue-600">Payment</span>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push(`/user/bookings/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Booking
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-1">Your booking is confirmed — complete payment to finalise.</p>
        </div>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Service</p>
              <h2 className="text-lg font-semibold text-gray-900">{booking.service?.title ?? "Service"}</h2>
              {booking.provider?.businessName && (
                <p className="text-sm text-gray-500 mt-1">{booking.provider.businessName}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">${booking.price.toFixed(2)}</p>
              <p className="text-xs text-gray-400">total due</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
              <p className="font-medium text-gray-900 mt-0.5">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
              <p className="font-medium text-gray-900 mt-0.5">{booking.time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Booking ID</p>
              <p className="font-medium text-gray-900 mt-0.5">#{booking.id.slice(-6).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
              <span className="inline-flex mt-0.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Stripe Elements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary:    "#2563eb",
                  colorBackground: "#ffffff",
                  colorText:       "#1e293b",
                  colorDanger:     "#ef4444",
                  fontFamily:      "system-ui, sans-serif",
                  borderRadius:    "10px",
                },
              },
            }}
          >
            <CheckoutForm booking={booking} />
          </Elements>
        </div>

      </div>
    </div>
  );
}