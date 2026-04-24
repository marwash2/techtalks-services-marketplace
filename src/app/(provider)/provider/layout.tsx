import ProviderSidebar from "@/components/provider/ProviderSidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProviderSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
