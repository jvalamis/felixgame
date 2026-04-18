import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface GameStatusProps {
  status: "waiting" | "playing" | "finished"
  currentTurnId: string | null
  currentUserId: string
  playerX: Profile | null
  playerO: Profile | null
  winner: string | null
  isDraw: boolean
}

export function GameStatus({
  status,
  currentTurnId,
  currentUserId,
  playerX,
  playerO,
  winner,
  isDraw,
}: GameStatusProps) {
  const isPlayerX = currentUserId === playerX?.id
  const isPlayerO = currentUserId === playerO?.id
  const isMyTurn = currentTurnId === currentUserId

  if (status === "waiting") {
    return (
      <div className="text-center">
        <Badge variant="secondary" className="mb-2">Waiting for opponent</Badge>
        <p className="text-muted-foreground">Share the invite link with a friend to start playing</p>
      </div>
    )
  }

  if (status === "finished") {
    if (isDraw) {
      return (
        <div className="text-center">
          <Badge variant="outline" className="mb-2">Game Over</Badge>
          <p className="text-xl font-semibold">{"It's a draw!"}</p>
        </div>
      )
    }

    const winnerProfile = winner === playerX?.id ? playerX : playerO
    const isWinner = winner === currentUserId

    return (
      <div className="text-center">
        <Badge variant={isWinner ? "default" : "destructive"} className="mb-2">
          Game Over
        </Badge>
        <p className="text-xl font-semibold">
          {isWinner ? "You won!" : `${winnerProfile?.username || "Opponent"} won!`}
        </p>
      </div>
    )
  }

  // Playing status
  return (
    <div className="flex items-center justify-center gap-6">
      <div className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
        isPlayerX && isMyTurn && "bg-game-x/10",
        !isPlayerX && !isMyTurn && playerX && "bg-game-x/10"
      )}>
        <span className="text-sm text-muted-foreground">X</span>
        <span className={cn(
          "font-semibold",
          currentTurnId === playerX?.id && "text-game-x"
        )}>
          {playerX?.username || "..."}
        </span>
        {currentTurnId === playerX?.id && (
          <Badge variant="outline" className="text-xs">Playing</Badge>
        )}
      </div>
      
      <span className="text-2xl text-muted-foreground">vs</span>
      
      <div className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
        isPlayerO && isMyTurn && "bg-game-o/10",
        !isPlayerO && !isMyTurn && playerO && "bg-game-o/10"
      )}>
        <span className="text-sm text-muted-foreground">O</span>
        <span className={cn(
          "font-semibold",
          currentTurnId === playerO?.id && "text-game-o"
        )}>
          {playerO?.username || "..."}
        </span>
        {currentTurnId === playerO?.id && (
          <Badge variant="outline" className="text-xs">Playing</Badge>
        )}
      </div>
    </div>
  )
}
