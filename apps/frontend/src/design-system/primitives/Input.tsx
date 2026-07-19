import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ className, label, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-dark-900">{label}</span>
      <input
        className={cn(
          "falcon-motion h-12 w-full rounded-2xl border border-border-subtle bg-white px-4 text-sm text-dark-900 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:bg-section disabled:text-slate-400",
          className
        )}
        {...props}
      />
    </label>
  );
}
