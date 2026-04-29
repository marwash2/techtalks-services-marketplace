type UserDashboardSummaryProps = {
  name?: string | null;
};

export default function UserDashboardSummary({
  name,
}: UserDashboardSummaryProps) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        User Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Welcome{name ? `, ${name}` : ""}. Your account area stays available
        while browsing services, bookings, and profile.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Services
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Browse and book
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Bookings
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Track requests
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Profile
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Manage account
          </p>
        </div>
      </div>
    </section>
  );
}
