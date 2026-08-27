import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#7C5CFF] text-white hover:bg-[#6D3EFF] shadow-sm shadow-[#7C5CFF]/20 active:scale-[0.98]",
        destructive:
          "bg-[#F87171] text-white hover:bg-[#ef4444]",
        outline:
          "border border-[#26262E] bg-[#16161C] text-[#F2F2F5] hover:bg-[#26262E] hover:text-white",
        secondary:
          "bg-[#26262E] text-[#F2F2F5] hover:bg-[#33333D]",
        ghost:
          "text-[#8B8B96] hover:bg-[#16161C] hover:text-[#F2F2F5]",
        link:
          "text-[#7C5CFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
