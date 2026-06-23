export default function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center space-x-4 border-b border-slate-100 p-4">
      <div className="h-4 w-16 rounded bg-slate-200" />
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="h-4 flex-1 rounded bg-slate-200" />
      <div className="h-8 w-24 rounded bg-slate-200" />
    </div>
  );
}