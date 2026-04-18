export default function ProviderDetailsLoading() {
  return (
    <div className="mx-auto max-w-7xl py-10">
      <div className="grid gap-8 xl:grid-cols-[1.5fr_0.85fr]">
        <div className="space-y-8">
          <div className="h-72 animate-pulse rounded-[32px] bg-slate-100" />
          <div className="h-96 animate-pulse rounded-[32px] bg-slate-100" />
        </div>
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[32px] bg-slate-100" />
          <div className="h-80 animate-pulse rounded-[32px] bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
