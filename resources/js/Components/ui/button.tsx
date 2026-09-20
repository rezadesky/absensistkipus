import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#0F2747] text-white hover:bg-[#163866] active:bg-[#08172c] shadow-sm",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
      link: "text-[#F28C28] underline-offset-4 hover:underline",
      accent: "bg-[#F28C28] text-white hover:bg-[#d76f17] active:bg-[#b25315] shadow-sm",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-xs sm:text-sm",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-8 text-sm sm:text-base",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
