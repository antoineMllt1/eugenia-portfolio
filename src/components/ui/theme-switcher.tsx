"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, Sparkles, GraduationCap, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "eugenia" | "albert"

interface ThemeOption {
  id: Theme
  label: string
  icon: React.FC<{ className?: string }>
  description: string
}

const themes: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description: "Clean & bright"
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes"
  },
  {
    id: "eugenia",
    label: "Eugenia",
    icon: Sparkles,
    description: "Brand energy"
  },
  {
    id: "albert",
    label: "Albert",
    icon: GraduationCap,
    description: "Professional blue"
  }
]

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("light")
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme)
    // Also add/remove dark class for Tailwind dark mode compatibility
    if (theme === "dark" || theme === "eugenia" || theme === "albert") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("eugenia-theme") as Theme | null
    if (savedTheme && ["light", "dark", "eugenia", "albert"].includes(savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const defaultTheme = prefersDark ? "dark" : "light"
      setCurrentTheme(defaultTheme)
      applyTheme(defaultTheme)
    }
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    localStorage.setItem("eugenia-theme", theme)
    setIsOpen(false)
  }

  const currentThemeData = themes.find(t => t.id === currentTheme)!
  const CurrentIcon = currentThemeData.icon

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "theme-switcher flex items-center gap-2 px-3 py-2 cursor-pointer",
          "hover:scale-105 active:scale-95 transition-all",
          "bg-background border border-border rounded-full"
        )}
        whileTap={{ scale: 0.95 }}
        aria-label="Change theme"
        aria-expanded={isOpen}
        type="button"
      >
        <motion.div
          key={currentTheme}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <CurrentIcon className={cn(
            "h-4 w-4",
            currentTheme === "eugenia" && "text-[#f97316]",
            currentTheme === "albert" && "text-[#245076]",
            currentTheme === "dark" && "text-blue-400",
            currentTheme === "light" && "text-amber-500"
          )} />
        </motion.div>
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {currentThemeData.label}
        </span>
        <ChevronDown className={cn(
          "h-3 w-3 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "theme-switcher-dropdown absolute top-full left-0 mt-2 p-2 min-w-[200px]",
              "bg-background border border-border rounded-lg shadow-lg",
              "z-[100] overflow-hidden"
            )}
          >
            {themes.map((theme) => {
              const Icon = theme.icon
              const isActive = currentTheme === theme.id

              return (
                <motion.button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isActive
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/50 text-foreground"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    theme.id === "eugenia" && "bg-gradient-to-br from-[#ed3d66] to-[#f97316]",
                    theme.id === "albert" && "bg-gradient-to-br from-[#245076] to-[#3a6fa5]",
                    theme.id === "dark" && "bg-slate-800",
                    theme.id === "light" && "bg-amber-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      theme.id === "eugenia" && "text-white",
                      theme.id === "albert" && "text-white",
                      theme.id === "dark" && "text-blue-400",
                      theme.id === "light" && "text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{theme.label}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}

            {/* Footer hint */}
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">
                Theme preference is saved locally
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { ThemeSwitcher }



