"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UploadPhoto from "@/components/upload/UploadPhoto";

import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Heart,
  Clock3,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  Settings,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  Check,
  Camera,
  Phone,
  MapPin,
} from "lucide-react";

export default function UserProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userInitial = user?.name?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    async function fetchUserAvatar() {
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/users/${user.id}?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const currentUser = data?.data || data?.user;
        setAvatar(currentUser?.avatar || "");
      } catch (error) {
        console.error("[UserProfile] Avatar fetch error:", error);
      }
    }

    fetchUserAvatar();
  }, [user?.id]);

  useEffect(() => {
    if (!avatarFile) return;
    uploadAvatar(avatarFile);
    // avoid stale re-renders while upload is in progress
    // (only one upload at a time)
  }, [avatarFile]);

  async function uploadAvatar(file: File) {
    if (!user?.id) {
      setErrorMsg("Please sign in again before updating your avatar.");
      setAvatarFile(null);
      return;
    }

    try {
      setUploadingAvatar(true);
      setErrorMsg("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "avatars");
      formData.append("target", "user");
      formData.append("id", user.id);

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
          "Upload endpoint returned non-JSON. Raw: " + rawText.slice(0, 120),
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }

      const rawUrl: string =
        data.url || data.imageUrl || data.publicUrl || data.path || "";

      if (!rawUrl) {
        throw new Error(
          "Upload succeeded but no URL returned. Response: " +
            JSON.stringify(data).slice(0, 120),
        );
      }

      const freshUrl = rawUrl.includes("?")
        ? `${rawUrl}&t=${Date.now()}`
        : `${rawUrl}?t=${Date.now()}`;

      setAvatar(freshUrl);
      setAvatarFile(null);
      setSuccessMsg("Avatar updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "Avatar upload failed.",
      );
      setAvatarFile(null);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">
          {/* Decorative Blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* LEFT */}
            <div className="flex items-center gap-5">
              {/* AVATAR */}
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                  <User className="w-3 h-3" />
                  User Profile
                </span>

                <h1
                  className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-2"
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  {form.name || user?.name || "User"}
                </h1>

                <p className="text-[#4b6fa8] text-sm leading-relaxed mb-5">
                  Manage your account and access your bookings and saved
                  services.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                    Verified Account
                  </span>
                  <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Active Member
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(errorMsg || successMsg) && (
          <section className="space-y-3">
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </section>
        )}

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: CalendarDays, label: "Bookings", value: "12", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Heart, label: "Favorites", value: "8", color: "text-rose-500", bg: "bg-rose-50" },
            { icon: Clock3, label: "Upcoming", value: "3", color: "text-green-500", bg: "bg-green-50" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>

                <span className="text-xs uppercase tracking-widest text-[#8aa6ca] font-semibold">
                  {item.label}
                </span>
              </div>

              <h3
                className="text-4xl text-[#1e3a5f] mb-1"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                {item.value}
              </h3>
            </div>
          ))}
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* LEFT SIDE */}
          <div className="space-y-5">
            {/* ACCOUNT INFO */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2
                    className="text-2xl text-[#1e3a5f]"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                    }}
                  >
                    Account Information
                  </h2>
                  <p className="text-sm text-[#6b93c4]">
                    {editing ? "Update your details below" : "Your basic account details"}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={user?.name || "Not provided"}
                />

                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={user?.email || "Not provided"}
                />

                <InfoCard
                  icon={ShieldCheck}
                  label="Account Type"
                  value="User Account"
                />

                <InfoCard icon={BadgeCheck} label="Status" value="Verified" />
              </div>
            </div>

            {/* QUICK ACCESS */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2
                    className="text-2xl text-[#1e3a5f]"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                    }}
                  >
                    Quick Access
                  </h2>
                  <p className="text-sm text-[#6b93c4]">Navigate through your account</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: CalendarDays, title: "My Bookings", href: "/user/bookings" },
                  { icon: Heart, title: "Favorites", href: "/user/favorites" },
                  { icon: BriefcaseBusiness, title: "Browse Services", href: "/services" },
                  { icon: Settings, title: "Settings", href: "/user/settings" },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group border border-blue-100 rounded-2xl p-5 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-blue-600" />
                        </div>

                        <span className="font-medium text-[#1e3a5f]">
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* PROFILE CARD */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-7">
              <div className="text-center">
                <div className="mb-5 flex justify-center">
                  <UploadPhoto
                    file={avatarFile}
                    setFile={setAvatarFile}
                    preview={avatar}
                    uploading={uploadingAvatar}
                    initials={userInitial}
                  />
                </div>

                <h2
                  className="text-2xl text-[#1e3a5f] mb-1"
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  {user?.name || "User"}
                </h2>

                <p className="text-sm text-[#6b93c4] mb-6">{user?.email}</p>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <ShieldCheck className="w-5 h-5" />

                    <span className="font-semibold">Verified Account</span>
                  </div>
                  <p className="text-sm text-[#6b93c4] leading-relaxed">
                    Your account is active and verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3 text-blue-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-medium text-[#1e3a5f] break-words">{value}</p>
    </div>
  );
}

function EditField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3 text-blue-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>

      <p className="text-sm font-medium text-[#1e3a5f] break-words">{value}</p>
    </div>
  );
}
