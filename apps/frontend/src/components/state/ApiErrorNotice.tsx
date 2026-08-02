import { RotateCcw } from "lucide-react";
import { Button } from "@/design-system/primitives";

type ApiErrorNoticeProps = {
  className?: string;
  message: string;
  onRetry?: () => void;
};

export function ApiErrorNotice({
  className = "",
  message,
  onRetry = () => window.location.reload()
}: ApiErrorNoticeProps) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <span>{message}</span>
      <Button className="h-10 shrink-0 rounded-xl px-3 text-xs" onClick={onRetry} type="button" variant="secondary">
        <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
        إعادة المحاولة
      </Button>
    </div>
  );
}
