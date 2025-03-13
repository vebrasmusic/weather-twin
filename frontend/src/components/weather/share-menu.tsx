"use client"

import { Twitter, Instagram, Slack, Link, Share2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ShareMenu() {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent("Check out this climate twin match I found!")

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case "instagram":
        // Instagram doesn't have a direct share URL, but we can open Instagram
        shareUrl = "https://instagram.com"
        break
      case "slack":
        shareUrl = `https://slack.com/app_redirect?app=A028UP5PWS9&tab=share&url=${url}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-300">
          <span className="sr-only">Share</span>
          <span className="flex items-center gap-1">
            <span className="text-xs font-mono">Share</span>
            <span className="h-4 w-4">
              <Share2 className="h-4 w-4" />
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gradient-to-br from-black to-[#041008] border-[#0A1A0A] text-white"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-[#0A1A0A] font-mono text-xs"
          onClick={() => handleShare("twitter")}
        >
          <Twitter className="h-4 w-4 text-gray-400" />
          <span>Share on X</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-[#0A1A0A] font-mono text-xs"
          onClick={() => handleShare("instagram")}
        >
          <Instagram className="h-4 w-4 text-gray-400" />
          <span>Share on Instagram</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-[#0A1A0A] font-mono text-xs"
          onClick={() => handleShare("slack")}
        >
          <Slack className="h-4 w-4 text-gray-400" />
          <span>Share on Slack</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-[#0A1A0A] font-mono text-xs"
          onClick={handleCopyLink}
        >
          <Link className="h-4 w-4 text-gray-500" />
          <span>{copied ? "Copied!" : "Copy link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

