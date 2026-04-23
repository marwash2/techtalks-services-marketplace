import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="h-[400px] max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center rounded-xl shadow-sm border bg-white">
      <div className="pt-6 space-y-4 p-4">
        {icon && (
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100">
            {icon}
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {description && (
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="pt-4">{action}</div>}
      </div>
    </div>
  );
}
