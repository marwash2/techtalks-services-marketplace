type CardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

export default function FeatureCard({ icon, title, desc }: CardProps) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:shadow-md transition">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white mb-3 shadow-sm">
        {icon}
      </div>

      <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>

      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
