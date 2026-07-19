import { LoaderCircle } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-brand border border-border-subtle bg-white p-4 text-sm font-medium text-slate-600 shadow-subtle">
      <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.75} />
      Loading system preview
    </div>
  );
}
