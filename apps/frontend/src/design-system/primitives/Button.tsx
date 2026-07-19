import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-dark-900 text-white shadow-subtle hover:-translate-y-0.5 hover:bg-slate-800 disabled:hover:translate-y-0",
  secondary:
    "border border-border-subtle bg-white text-dark-900 shadow-subtle hover:-translate-y-0.5 hover:border-accent-500 disabled:hover:translate-y-0",
  accent:
    "falcon-gradient text-dark-900 shadow-subtle hover:-translate-y-0.5 hover:shadow-soft disabled:hover:translate-y-0",
  ghost: "bg-transparent text-dark-900 hover:bg-section"
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "falcon-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-center text-sm font-semibold leading-tight outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.75} />
      ) : null}
      {children}
    </button>
  );
}
