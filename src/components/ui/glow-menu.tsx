"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MenuItem {
    id?: string
    icon: LucideIcon | React.FC
    label: string
    href: string
    gradient?: string
    iconColor?: string
}

interface MenuBarProps {
    items: MenuItem[]
    activeItem?: string
    onItemClick?: (label: string) => void
    className?: string
}

const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 2,
        transition: {
            opacity: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
        } as any,
    },
}

const navGlowVariants = {
    initial: { opacity: 0 },
    hover: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeInOut",
        } as any,
    },
}

const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
} as any

// Eugenia Brand gradient
const brandGradient = "radial-gradient(circle, rgba(237, 61, 102, 0.15) 0%, rgba(237, 61, 102, 0.06) 50%, rgba(237, 61, 102, 0) 100%)"

export const MenuBar = React.forwardRef<any, MenuBarProps>(
    ({ className, items, activeItem, onItemClick }, ref) => {
        return (
            <motion.nav
                ref={ref}
                className={cn(
                    "p-2 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-[var(--shadow-soft)] relative overflow-hidden",
                    className,
                )}
                initial="initial"
                whileHover="hover"
            >
                <motion.div
                    className="absolute -inset-2 bg-gradient-radial from-transparent via-primary/10 to-transparent rounded-full z-0 pointer-events-none"
                    variants={navGlowVariants}
                />
                <ul className="flex items-center gap-1 relative z-10">
                    {items.map((item) => {
                        const Icon = item.icon
                        const isActive = (item.id || item.label) === activeItem

                        return (
                            <motion.li key={item.label} className="relative">
                                <button
                                    onClick={() => onItemClick?.(item.id || item.label)}
                                    className="block w-full"
                                >
                                    <motion.div
                                        className="block rounded-full overflow-visible group relative"
                                        style={{ perspective: "600px" }}
                                        whileHover="hover"
                                        initial="initial"
                                    >
                                        <motion.div
                                            className="absolute inset-0 z-0 pointer-events-none"
                                            variants={glowVariants}
                                            animate={isActive ? "hover" : "initial"}
                                            style={{
                                                background: brandGradient,
                                                opacity: isActive ? 1 : 0,
                                                borderRadius: "9999px",
                                            }}
                                        />
                                        <motion.div
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 relative z-10 bg-transparent transition-colors rounded-full",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover:text-foreground",
                                            )}
                                            variants={itemVariants}
                                            transition={sharedTransition}
                                            style={{
                                                transformStyle: "preserve-3d",
                                                transformOrigin: "center bottom",
                                            }}
                                        >
                                            <span
                                                className={cn(
                                                    "transition-colors duration-300",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </motion.div>
                                        <motion.div
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 absolute inset-0 z-10 bg-transparent transition-colors rounded-full",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover:text-foreground",
                                            )}
                                            variants={backVariants}
                                            transition={sharedTransition}
                                            style={{
                                                transformStyle: "preserve-3d",
                                                transformOrigin: "center top",
                                                rotateX: 90,
                                            }}
                                        >
                                            <span
                                                className={cn(
                                                    "transition-colors duration-300",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </motion.div>
                                    </motion.div>
                                </button>
                            </motion.li>
                        )
                    })}
                </ul>
            </motion.nav>
        )
    },
)

MenuBar.displayName = "MenuBar"
