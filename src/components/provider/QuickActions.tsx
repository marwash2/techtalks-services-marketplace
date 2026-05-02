import Link from "next/link";
import { Plus, Users, Calendar, Briefcase } from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const quickActions: QuickAction[] = [
  {
    label: "Add New Service",
    href: "/provider/services",
    icon: Plus,
  },
  {
    label: "Update Profile",
    href: "/provider/profile",
    icon: Users,
  },
  {
    label: "Manage Bookings",
    href: "/provider/bookings",
    icon: Calendar,
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">Quick Actions</h3>
      <div className="mt-4 space-y-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
