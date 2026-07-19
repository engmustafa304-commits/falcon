import { GitCompareArrows, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/design-system/primitives";
import { getStoredToken } from "@/services/authApi";
import { addCompareItem, addFavorite } from "@/services/savedCarsApi";
import { cn } from "@/utils/cn";

const FAVORITE_SUCCESS_MESSAGE = "تمت إضافة السيارة إلى المفضلة.";
const COMPARE_SUCCESS_MESSAGE = "تمت إضافة السيارة إلى المقارنة.";

type SavedCarActionsProps = {
  carId?: string;
  compact?: boolean;
  variant?: "default" | "icon";
};

export function SavedCarActions({ carId, compact = false, variant = "default" }: SavedCarActionsProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  async function handleAction(action: "favorite" | "compare") {
    if (!carId) {
      setMessage("هذه السيارة غير متصلة بقاعدة البيانات بعد.");
      return;
    }

    if (!getStoredToken()) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    setMessage(null);

    try {
      if (action === "favorite") {
        setIsFavoriteLoading(true);
        await addFavorite(carId);
        setIsFavorited(true);
        setMessage(FAVORITE_SUCCESS_MESSAGE);
      } else {
        setIsCompareLoading(true);
        await addCompareItem(carId);
        setMessage(COMPARE_SUCCESS_MESSAGE);
      }
    } catch {
      setMessage("تعذر تنفيذ العملية.");
    } finally {
      setIsFavoriteLoading(false);
      setIsCompareLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-2">
        <button
          aria-label={isFavorited ? "أُضيفت إلى المفضلة" : "أضف إلى المفضلة"}
          className={cn(
            "falcon-motion flex h-11 w-11 items-center justify-center rounded-full border shadow-soft backdrop-blur-md disabled:cursor-wait",
            isFavorited
              ? "border-accent-500/40 bg-accent-500/90 text-dark-900"
              : "border-white/20 bg-dark-900/55 text-white hover:border-accent-500/50 hover:text-accent-500"
          )}
          disabled={isFavoriteLoading}
          onClick={() => void handleAction("favorite")}
          type="button"
        >
          <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} strokeWidth={1.75} />
        </button>
        <button
          aria-label="أضف للمقارنة"
          className="falcon-motion flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-dark-900/55 text-white shadow-soft backdrop-blur-md hover:border-accent-500/50 hover:text-accent-500 disabled:cursor-wait"
          disabled={isCompareLoading}
          onClick={() => void handleAction("compare")}
          type="button"
        >
          <GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <p aria-live="polite" className="sr-only">{message}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "grid gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <Button
        className="min-h-11 rounded-xl px-3 py-2"
        isLoading={isFavoriteLoading}
        onClick={() => void handleAction("favorite")}
        type="button"
        variant="secondary"
      >
        <Heart className="h-4 w-4" strokeWidth={1.75} />
        المفضلة
      </Button>
      <Button
        className="min-h-11 rounded-xl px-3 py-2"
        isLoading={isCompareLoading}
        onClick={() => void handleAction("compare")}
        type="button"
        variant="secondary"
      >
        <GitCompareArrows className="h-4 w-4" strokeWidth={1.75} />
        مقارنة
      </Button>
      {message ? (
        <p className="text-xs font-semibold text-slate-500 sm:col-span-2">{message}</p>
      ) : null}
    </div>
  );
}
