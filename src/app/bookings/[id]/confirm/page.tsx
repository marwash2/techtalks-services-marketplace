"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Service {
  id: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  provider?: {
    id?: string;
    _id?: string;
    userId?: { name: string; image?: string };
    businessName?: string;
    location?: string;
  };
  providerId?: {
    id?: string;
    _id?: string;
    businessName?: string;
    location?: string;
  };
}

export default function ConfirmBookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const id = params.id;
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const notes = searchParams.get("notes") || "";

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        const data = await res.json();
        setService(data.data.service ?? data.data ?? data);
      } catch {
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleConfirm = async () => {
    if (!service || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const serviceId = service.id ?? service._id;
      const providerId =
        service.providerId?.id ??
        service.providerId?._id ??
        service.provider?.id ??
        service.provider?._id;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          providerId,
          date,
          time,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? err.message ?? "Booking failed");
      }

      router.push("/user/bookings?success=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    const query = new URLSearchParams({ date: date || "", time: time || "", notes: notes || "" });
    router.push(`/bookings/${id}?${query.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-wide">Loading…</p>
        </div>
      </div>
    );
  }

  if (!service || !date || !time) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">Invalid booking data</p>
          <button onClick={() => router.push("/services")} className="text-blue-600 text-sm underline cursor-pointer">
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  const providerName = service.provider?.userId?.name ?? service.provider?.businessName ?? service.providerId?.businessName ?? "Provider";
  const providerLocation = service.provider?.location ?? service.providerId?.location;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-600">Booking Details</span>
          </div>
          <div className="flex-1 h-px bg-green-600 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm font-medium text-blue-600">Confirm</span>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Your Booking</h1>
          <p className="text-gray-500 text-sm mt-1">Please confirm the details before finalizing.</p>
        </div>

        {/* Service Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Service</p>
              <h2 className="text-lg font-semibold text-gray-900">{service.title}</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">${service.price}</p>
              <p className="text-xs text-gray-400">total</p>
            </div>
          </div>

          {providerName && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{providerName}</span>
              {providerLocation && <span className="text-gray-400">·</span>}
              {providerLocation && <span>{providerLocation}</span>}
            </div>
          )}
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Appointment Details</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{time}</p>
              </div>
            </div>

            {notes && (
              <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-gray-600 mt-0.5 italic">"{notes}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Booking
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          The provider will be notified once you confirm.
        </p>
      </div>
    </div>
  );
}