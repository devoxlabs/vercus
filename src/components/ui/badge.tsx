import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-2 border-white bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-primary/80",
        secondary:
          "border-2 border-white bg-secondary text-secondary-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-secondary/80",
        destructive:
          "border-2 border-white bg-destructive text-destructive-foreground shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-destructive/80",
        outline: "text-foreground border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
