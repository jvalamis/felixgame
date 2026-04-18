import type { Profile } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, X, Minus } from "lucide-react"

interface UserStatsProps {
  profile: Profile
}

export function UserStats({ profile }: UserStatsProps) {
  const totalGames = profile.wins + profile.losses + profile.draws
  const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="flex flex-col items-center p-4">
          <Trophy className="h-5 w-5 text-accent mb-1" />
          <span className="text-2xl font-bold">{profile.wins}</span>
          <span className="text-xs text-muted-foreground">Wins</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center p-4">
          <X className="h-5 w-5 text-destructive mb-1" />
          <span className="text-2xl font-bold">{profile.losses}</span>
          <span className="text-xs text-muted-foreground">Losses</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center p-4">
          <Minus className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-2xl font-bold">{profile.draws}</span>
          <span className="text-xs text-muted-foreground">Draws</span>
        </CardContent>
      </Card>
    </div>
  )
}
