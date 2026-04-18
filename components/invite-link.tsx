"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Link } from "lucide-react"

interface InviteLinkProps {
  gameId: string
}

export function InviteLink({ gameId }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/game/${gameId}` 
    : `/game/${gameId}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input")
      input.value = inviteUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link className="h-4 w-4" />
        <span>Share this link with a friend:</span>
      </div>
      <div className="flex gap-2">
        <Input
          readOnly
          value={inviteUrl}
          className="font-mono text-sm"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-accent" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy link</span>
        </Button>
      </div>
    </div>
  )
}
