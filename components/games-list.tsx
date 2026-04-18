"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Game } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface GamesListProps {
  games: Game[]
  currentUserId: string
  title: string
  emptyMessage: string
}

export function GamesList({ games, currentUserId, title, emptyMessage }: GamesListProps) {
  if (games.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-2">
        {games.map((game) => {
          const isPlayerX = game.player_x === currentUserId
          const opponent = isPlayerX ? game.player_o_profile : game.player_x_profile
          const isMyTurn = game.current_turn === currentUserId
          const didWin = game.winner === currentUserId
          const didLose = game.winner && game.winner !== currentUserId

          return (
            <Link key={game.id} href={`/game/${game.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        vs {opponent?.username || "Waiting..."}
                      </span>
                      <Badge
                        variant={
                          game.status === "waiting"
                            ? "secondary"
                            : game.status === "playing"
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          game.status === "finished" && didWin && "bg-accent text-accent-foreground",
                          game.status === "finished" && didLose && "bg-destructive text-destructive-foreground"
                        )}
                      >
                        {game.status === "waiting" && "Waiting"}
                        {game.status === "playing" && (isMyTurn ? "Your turn" : "Their turn")}
                        {game.status === "finished" && (game.is_draw ? "Draw" : didWin ? "Won" : "Lost")}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(game.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
