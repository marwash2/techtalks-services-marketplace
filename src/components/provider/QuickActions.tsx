import Link from "next/link";
import { Plus, Calendar, Star, UserCog, ChevronRight } from "lucide-react";

const actions = [
  {
    label: "Add service",
    href: "/provider/services/new",
    icon: Plus,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Availability",
    href: "/provider/availability",
    icon: Calendar,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Reviews",
    href: "/provider/reviews",
    icon: Star,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Edit profile",
    href: "/provider/profile",
    icon: UserCog,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
      </div>
      <ul className="divide-y divide-slate-50 px-3 py-2">
        {actions.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.8} />
              </div>
              <span className="flex-1 text-sm font-medium text-slate-800">
                {label}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}