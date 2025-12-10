import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-foreground border-border flex h-10 w-full min-w-0 rounded-[var(--radius-md)] border bg-background px-4 py-2 text-sm transition-all duration-200 outline-none",
                "file:inline-flex file:h-8 file:border-0 file:bg-accent file:text-primary file:text-sm file:font-medium file:rounded-full file:px-3 file:mr-3 file:cursor-pointer",
                "hover:border-primary/30",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

export { Input }
