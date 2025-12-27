"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollingLogoProps {
  className?: string
}

export const ScrollingLogo: React.FC<ScrollingLogoProps> = ({ className }) => {
  // Logo components - alternating between Eugenia and Albert
  const EugeniaLogo = (
    <div className="flex items-center justify-center h-full px-6">
      <img
        src="/logo%20eugenia.png"
        alt="Eugenia School"
        className="h-8 w-auto object-contain max-w-[200px]"
        onError={() => {
          // Fallback if image doesn't load
          console.warn('Failed to load Eugenia logo');
        }}
      />
    </div>
  )

  const AlbertLogo = (
    <div className="flex items-center justify-center h-full px-6">
      <img
        src="/logo%20albert.png"
        alt="Albert"
        className="h-8 w-auto object-contain max-w-[200px]"
        onError={() => {
          // Fallback if image doesn't load
          console.warn('Failed to load Albert logo');
        }}
      />
    </div>
  )

  // Create alternating logo sequence
  const createLogoSequence = (length: number, prefix: string) => {
    return Array.from({ length }).map((_, i) => {
      const isEugenia = i % 2 === 0
      return (
        <div key={`${prefix}-logo-${i}`} className="flex-shrink-0 h-full flex items-center">
          {isEugenia ? EugeniaLogo : AlbertLogo}
        </div>
      )
    })
  }

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      <div className="flex animate-scroll h-full items-center">
        {/* First set of logos */}
        <div className="flex items-center h-full gap-0">
          {createLogoSequence(12, "first")}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center h-full gap-0" aria-hidden="true">
          {createLogoSequence(12, "second")}
        </div>
      </div>
    </div>
  )
}

