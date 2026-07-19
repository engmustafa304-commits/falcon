import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ImageWithFallbackProps = {
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackSrc?: string;
  src: string;
};

export function ImageWithFallback({
  alt,
  className,
  fallbackClassName,
  fallbackSrc,
  src
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-section via-white to-accent-500/10 text-slate-400",
          fallbackClassName
        )}
        role="img"
      >
        <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }

        setHasError(true);
      }}
      src={currentSrc}
    />
  );
}
