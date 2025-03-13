"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface SearchInputProps {
  onSearch: (city: string) => void
  isLoading: boolean
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [city, setCity] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && city.trim()) {
      onSearch(city)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city name..."
        className="w-full bg-transparent text-4xl font-light text-white border-b border-[#0A1A0A] pb-2 outline-none focus:border-gray-700 transition-colors placeholder:text-gray-800"
        autoFocus
        onKeyDown={handleKeyDown}
      />

      <div className="absolute right-0 bottom-3">
        {isLoading ? (
          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-gray-600 animate-spin"></div>
        ) : (
          city && <p className="text-xs text-gray-500 font-mono">Press Enter to continue</p>
        )}
      </div>
    </div>
  )
}

