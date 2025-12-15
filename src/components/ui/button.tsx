import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)] hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0",
                destructive:
                    "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md",
                outline:
                    "border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                brand:
                    "bg-primary text-white font-semibold shadow-sm hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0",
            },
            size: {
                default: "h-10 px-5 py-2 rounded-full",
                sm: "h-8 px-4 text-xs rounded-full",
                lg: "h-12 px-8 text-base rounded-full",
                icon: "size-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
