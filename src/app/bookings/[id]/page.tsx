"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Service {
  id: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category?: { name: string };
  categoryId?: { name: string };
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

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM",
];

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Restore form state when coming back from confirm page
  useEffect(() => {
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const n = searchParams.get("notes");
    if (date) setSelectedDate(date);
    if (time) setSelectedTime(time);
    if (n) setNotes(n);
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      try {
        setLoadingService(true);
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        setService(data.data.service ?? data.data ?? data);
      } catch (err: unknown) {
        setServiceError(err instanceof Error ? err.message : "Failed to load service");
      } finally {
        setLoadingService(false);
      }
    };
    fetchService();
  }, [id]);

  const today = new Date().toISOString().split("T")[0];

  const validate = (): string | null => {
    if (!selectedDate) return "Please select a date.";
    if (!selectedTime) return "Please select a time slot.";
    if (selectedDate < today) return "Please select a future date.";
    return null;
  };

  const handleContinue = () => {
    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    const query = new URLSearchParams({ date: selectedDate, time: selectedTime, notes });
    router.push(`/bookings/${id}/confirm?${query.toString()}`);
  };

  if (status === "loading" || loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-wide">Loading service…</p>
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">{serviceError ?? "Service not found"}</p>
          <button onClick={() => router.back()} className="text-blue-600 text-sm underline cursor-pointer">Go back</button>
        </div>
      </div>
    );
  }

  const categoryName = service.category?.name ?? service.categoryId?.name ?? null;
  const providerName = service.provider?.userId?.name ?? service.provider?.businessName ?? service.providerId?.businessName ?? null;
  const providerLocation = service.provider?.location ?? service.providerId?.location ?? null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-sm font-medium text-blue-600">Booking Details</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm text-gray-400">Confirm</span>
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

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below to continue.</p>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Service</p>
              <h2 className="text-lg font-semibold text-gray-900">{service.title}</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900">${service.price}</p>
              <p className="text-xs text-gray-400">per session</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-sm text-gray-500">
            {service.duration && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {service.duration} min
              </span>
            )}
            {categoryName && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {categoryName}
              </span>
            )}
            {providerName && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {providerName}
              </span>
            )}
            {providerLocation && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {providerLocation}
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSubmitError(null); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition"
          />
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Time Slot <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => { setSelectedTime(slot); setSubmitError(null); }}
                className={`text-sm py-2.5 px-3 rounded-xl border font-medium transition-all cursor-pointer ${
                  selectedTime === slot
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any special instructions for the provider…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{notes.length}/500</p>
        </div>

        {/* Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          Continue to Review
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          You'll review your booking before it's confirmed.
        </p>
      </div>
    </div>
  );
}