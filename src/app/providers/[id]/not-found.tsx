import Link from "next/link";

export default function ProviderNotFound() {
  return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
          Provider Not Found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          We couldn&apos;t find that provider
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The provider id in the URL does not match any provider record in the
          database, or the profile has been removed.
        </p>
        <Link
          href="/providers"
          className="mt-8 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Back to providers
        </Link>
      </div>
    </div>
  );
}
