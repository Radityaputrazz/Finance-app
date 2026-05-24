import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none",
        "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
        "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
        "placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
          : "border-gray-200 dark:border-slate-600",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";