import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  delta?: string;
  deltaPositive?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  delta,
  deltaPositive = true,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bgColor} mb-4`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} strokeWidth={1.8} />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {delta && (
        <p
          className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${
            deltaPositive ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          <span>{deltaPositive ? "↑" : "↓"}</span>
          {delta}
        </p>
      )}
    </div>
  );
}