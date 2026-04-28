import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: StatsCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-950">{value}</p>
          <p className="text-sm text-slate-600">{title}</p>
        </div>
      </div>
    </div>
  );
}
