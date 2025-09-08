import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-accent1 px-4 py-2 text-sm font-medium text-text shadow-glass hover:bg-accent2 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
