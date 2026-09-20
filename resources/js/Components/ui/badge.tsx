import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-[#0F2747] text-white hover:bg-[#0F2747]/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-rose-50 text-rose-700 border-rose-200",
    outline: "text-slate-950 border-slate-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    accent: "border-transparent bg-[#F28C28]/10 text-[#F28C28] font-bold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
