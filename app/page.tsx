import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { UserStats } from "@/components/user-stats"
import { GamesList } from "@/components/games-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut } from "lucide-react"
import type { Game, Profile } from "@/lib/types"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    // User doesn't have a profile, redirect to create one
    redirect("/auth/login")
  }

  // Fetch user's active games (waiting or playing)
  const { data: activeGames } = await supabase
    .from("games")
    .select(`
      *,
      player_x_profile:profiles!games_player_x_fkey(*),
      player_o_profile:profiles!games_player_o_fkey(*)
    `)
    .or(`player_x.eq.${user.id},player_o.eq.${user.id}`)
    .in("status", ["waiting", "playing"])
    .order("updated_at", { ascending: false })

  // Fetch recent finished games
  const { data: recentGames } = await supabase
    .from("games")
    .select(`
      *,
      player_x_profile:profiles!games_player_x_fkey(*),
      player_o_profile:profiles!games_player_o_fkey(*)
    `)
    .or(`player_x.eq.${user.id},player_o.eq.${user.id}`)
    .eq("status", "finished")
    .order("updated_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Tic Tac Toe</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile.username}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {profile.username}!</CardTitle>
              <CardDescription>Your game stats</CardDescription>
            </CardHeader>
            <CardContent>
              <UserStats profile={profile as Profile} />
            </CardContent>
          </Card>

          <form action={createGame}>
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Game
            </Button>
          </form>

          <GamesList
            games={(activeGames || []) as Game[]}
            currentUserId={user.id}
            title="Active Games"
            emptyMessage="No active games. Create a new one to play!"
          />

          <GamesList
            games={(recentGames || []) as Game[]}
            currentUserId={user.id}
            title="Recent Games"
            emptyMessage="No completed games yet."
          />
        </div>
      </main>
    </div>
  )
}

async function createGame() {
  "use server"
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      player_x: user.id,
      status: "waiting",
    })
    .select()
    .single()

  if (error || !game) {
    redirect("/?error=create_failed")
  }

  redirect(`/game/${game.id}`)
}
