import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GameClient } from "./game-client"
import type { Game, Profile } from "@/lib/types"

interface GamePageProps {
  params: Promise<{ id: string }>
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/game/${id}`)
  }

  // Fetch the game with player profiles
  const { data: game, error } = await supabase
    .from("games")
    .select(`
      *,
      player_x_profile:profiles!games_player_x_fkey(*),
      player_o_profile:profiles!games_player_o_fkey(*)
    `)
    .eq("id", id)
    .single()

  if (error || !game) {
    redirect("/?error=game_not_found")
  }

  // Fetch current user's profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!currentProfile) {
    redirect("/auth/login")
  }

  // Check if user can join this game
  const isPlayerX = game.player_x === user.id
  const isPlayerO = game.player_o === user.id
  const canJoin = game.status === "waiting" && !isPlayerX && !game.player_o

  return (
    <GameClient
      initialGame={game as Game}
      currentUserId={user.id}
      currentProfile={currentProfile as Profile}
      canJoin={canJoin}
    />
  )
}
