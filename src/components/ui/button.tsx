import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", href, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    }
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
    }
    const classes = cn(base, variants[variant], sizes[size], className)
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }
    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
