import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-xl border-b-4 border-foreground/20 hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90",
        outline:
          "border border-input bg-background rounded-xl hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 text-base",
        sm: "h-10 px-4 text-sm rounded-lg",
        lg: "h-16 px-8 text-lg",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
