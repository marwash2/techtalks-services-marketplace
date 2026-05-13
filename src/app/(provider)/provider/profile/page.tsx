"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Save,
  User,
  AlertCircle,
} from "lucide-react";
import UploadPhoto from "@/components/upload/UploadPhoto";

type ProviderProfile = {
  businessName: string;
  fullName: string;
  email: string;
  location: string;
  bio: string;
  photo: string;
};

export default function ProviderProfilePage() {
  const { data: session } = useSession();

  const [providerId, setProviderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState<ProviderProfile>({
    businessName: "",
    fullName: "",
    email: "",
    location: "",
    bio: "",
    photo: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!photoFile) return;
    uploadPhoto(photoFile);
  }, [photoFile]);

  // ── Fetch profile ─────────────────────────────────────────────────────────

  async function fetchProfile() {
    try {
      setLoading(true);
      setErrorMsg("");

      const sessionId = String(session?.user?.id ?? "");

      const res = await fetch("/api/providers", { cache: "no-store" });
      if (!res.ok)
        throw new Error(`API error ${res.status}: ${res.statusText}`);

      const data = await res.json();

      const providers: any[] =
        data?.data?.providers ??
        data?.providers ??
        (Array.isArray(data) ? data : []);

      let provider: any = null;

      for (const p of providers) {
        const uid = p.userId;

        // Case 1: userId is a plain string (unpopulated ObjectId)
        if (typeof uid === "string" && uid === sessionId) {
          provider = p;
          break;
        }

        // Case 2: userId is a populated object with _id
        if (uid && typeof uid === "object") {
          const uidStr = String(uid._id ?? uid.id ?? "");
          if (uidStr === sessionId) {
            provider = p;
            break;
          }
        }
      }

      // Last resort: only one provider in system
      if (!provider && providers.length === 1) {
        provider = providers[0];
      }

      if (!provider) {
        // ── The real fix: fetch the provider directly by session user ID ──
        // Since populate isn't working for all records, query by userId directly
        const directRes = await fetch(
          `/api/providers?userId=${sessionId}`,
          { cache: "no-store" }
        );

        if (directRes.ok) {
          const directData = await directRes.json();
          const directProviders: any[] =
            directData?.data?.providers ??
            directData?.providers ??
            (Array.isArray(directData) ? directData : []);

          if (directProviders.length > 0) {
            provider = directProviders[0];
          }
        }
      }

      if (!provider) {
        setErrorMsg(
          "Could not find your provider profile. " +
          "Make sure you completed onboarding and are signed in with the correct account."
        );
        return;
      }

      const id = String(provider.id ?? provider._id ?? "");
      setProviderId(id);

      // userId can be a string or a populated object
      const uid = provider.userId;
      const populatedName =
        uid && typeof uid === "object" ? uid.name ?? "" : "";
      const populatedEmail =
        uid && typeof uid === "object" ? uid.email ?? "" : "";

      const photo =
        provider.photo ||
        provider.profilePhoto ||
        provider.avatar ||
        (uid && typeof uid === "object" ? uid.image || "" : "") ||
        "";

      setForm({
        businessName: provider.businessName ?? "",
        fullName: populatedName || session?.user?.name || "",
        email: populatedEmail || session?.user?.email || "",
        location: provider.location ?? "",
        bio: provider.description ?? provider.bio ?? "",
        photo,
      });
    } catch (err: any) {
      console.error("[Profile] Fetch error:", err);
      setErrorMsg(err?.message ?? "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user?.id) fetchProfile();
  }, [session?.user?.id]);

  // ── Photo upload ──────────────────────────────────────────────────────────

  async function uploadPhoto(file: File) {
    setErrorMsg("");
    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "provider-photos");
      if (providerId) formData.append("providerId", providerId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "Upload endpoint returned non-JSON. Raw: " + rawText.slice(0, 120)
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }

      const rawUrl: string =
        data.url || data.imageUrl || data.publicUrl || data.path || data.secure_url || "";

      if (!rawUrl) {
        throw new Error(
          "Upload succeeded but no URL returned. Response: " +
          JSON.stringify(data).slice(0, 120)
        );
      }

      const freshUrl = rawUrl.includes("?")
        ? `${rawUrl}&t=${Date.now()}`
        : `${rawUrl}?t=${Date.now()}`;

      setForm((prev) => ({ ...prev, photo: freshUrl }));
      setPhotoFile(null);
      setSuccessMsg("Photo updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error("[Profile] Photo upload error:", err);
      setErrorMsg(err?.message ?? "Photo upload failed.");
      setPhotoFile(null);
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Form change ───────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMsg("");
    setErrorMsg("");
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) {
      setErrorMsg("Provider ID not found. Try refreshing.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch(`/api/providers/${providerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          description: form.bio,
          location: form.location,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        /* non-JSON */
      }

      if (!res.ok)
        throw new Error(data.error || data.message || "Update failed");

      setSuccessMsg("Profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.name?.[0]?.toUpperCase() ?? "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div>
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
            Provider
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Profile settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 leading-6">
            Manage your business information and public profile.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-[16px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-0.5 text-rose-600/80 text-xs leading-5">
                {errorMsg}
              </p>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Profile card */}
          <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <UploadPhoto
                file={photoFile}
                setFile={setPhotoFile}
                preview={form.photo}
                uploading={uploadingPhoto}
                initials={initials}
                label=""
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-slate-900 truncate">
                  {form.fullName || session?.user?.name || "Your Name"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Service Provider
                </p>
                {form.location && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <MapPin className="h-3 w-3" />
                    {form.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">
              Basic information
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Business name"
                icon={<BriefcaseBusiness className="h-4 w-4" />}
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Your business name"
              />
              <InputField
                label="Full name"
                icon={<User className="h-4 w-4" />}
                name="fullName"
                value={form.fullName || session?.user?.name || ""}
                disabled
                placeholder="Synced from account"
              />
              <InputField
                label="Email"
                icon={<Mail className="h-4 w-4" />}
                name="email"
                value={form.email || session?.user?.email || ""}
                disabled
                placeholder="Synced from account"
              />
              <InputField
                label="Location"
                icon={<MapPin className="h-4 w-4" />}
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY"
              />
            </div>
          </div>

          {/* About */}
          <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">
              About
            </h2>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Bio / Description
            </label>
            <textarea
              rows={5}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell clients about your services, experience, and what makes you stand out…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="mt-1.5 text-xs text-slate-400 text-right">
              {form.bio.length} characters
            </p>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Full name and email are synced from your account.
            </p>
            <button
              type="submit"
              disabled={saving || !providerId}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────

function InputField({
  label,
  icon,
  disabled,
  placeholder,
  name,
  value,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  name: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
            {icon}
          </div>
        )}
        <input
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            icon ? "pl-10" : "pl-4"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />
      </div>
      {disabled && (
        <p className="mt-1 text-[11px] text-slate-400">Synced from account</p>
      )}
    </div>
  );
}