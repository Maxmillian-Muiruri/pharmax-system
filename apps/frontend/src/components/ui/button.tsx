import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-[#0d4f5c] text-white hover:bg-[#164e63]",
        destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30",
        outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-md",
        secondary: "bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-500/30 hover:shadow-cyan-500/40",
        ghost: "hover:bg-slate-100 hover:text-slate-900 shadow-none hover:shadow-none hover:translate-x-0",
        link: "text-slate-900 underline-offset-4 hover:underline shadow-none hover:shadow-none hover:translate-x-0",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4 text-sm",
        lg: "h-14 px-10 text-lg rounded-xl shadow-lg hover:shadow-xl",
        icon: "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
