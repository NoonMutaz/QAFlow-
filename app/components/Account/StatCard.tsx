interface StatCardProps {
  label: string;
  value: number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-sm text-center">
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs font-medium text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}