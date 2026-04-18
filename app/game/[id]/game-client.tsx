"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GameBoard } from "@/components/game-board"
import { GameStatus } from "@/components/game-status"
import { InviteLink } from "@/components/invite-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { checkWinner, checkDraw, type Game, type Profile } from "@/lib/types"

interface GameClientProps {
  initialGame: Game
  currentUserId: string
  currentProfile: Profile
  canJoin: boolean
}

export function GameClient({
  initialGame,
  currentUserId,
  currentProfile,
  canJoin,
}: GameClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [game, setGame] = useState<Game>(initialGame)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPlayerX = game.player_x === currentUserId
  const isPlayerO = game.player_o === currentUserId
  const isMyTurn = game.current_turn === currentUserId
  const currentPlayer = game.current_turn === game.player_x ? "X" : "O"

  // Subscribe to game updates
  useEffect(() => {
    const channel = supabase
      .channel(`game:${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${game.id}`,
        },
        async (payload) => {
          // Fetch updated game with profiles
          const { data: updatedGame } = await supabase
            .from("games")
            .select(`
              *,
              player_x_profile:profiles!games_player_x_fkey(*),
              player_o_profile:profiles!games_player_o_fkey(*)
            `)
            .eq("id", game.id)
            .single()

          if (updatedGame) {
            setGame(updatedGame as Game)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [game.id, supabase])

  const joinGame = useCallback(async () => {
    if (!canJoin || joining) return
    setJoining(true)
    setError(null)

    const { error } = await supabase
      .from("games")
      .update({
        player_o: currentUserId,
        status: "playing",
        current_turn: game.player_x, // X goes first
        updated_at: new Date().toISOString(),
      })
      .eq("id", game.id)

    if (error) {
      setError("Failed to join game")
      setJoining(false)
      return
    }

    // Update local state
    setGame((prev) => ({
      ...prev,
      player_o: currentUserId,
      player_o_profile: currentProfile,
      status: "playing",
      current_turn: game.player_x,
    }))
    setJoining(false)
  }, [canJoin, joining, currentUserId, game.id, game.player_x, currentProfile, supabase])

  // Auto-join if user followed invite link
  useEffect(() => {
    if (canJoin && !joining) {
      joinGame()
    }
  }, [canJoin, joining, joinGame])

  async function makeMove(index: number) {
    if (!isMyTurn || game.status !== "playing" || game.board[index] !== "") {
      return
    }

    const newBoard = [...game.board]
    newBoard[index] = isPlayerX ? "X" : "O"

    const { winner } = checkWinner(newBoard)
    const isDraw = checkDraw(newBoard)

    const nextTurn = isPlayerX ? game.player_o : game.player_x
    const newStatus = winner || isDraw ? "finished" : "playing"

    const { error } = await supabase
      .from("games")
      .update({
        board: newBoard,
        current_turn: newStatus === "finished" ? null : nextTurn,
        status: newStatus,
        winner: winner ? currentUserId : null,
        is_draw: isDraw,
        updated_at: new Date().toISOString(),
      })
      .eq("id", game.id)

    if (error) {
      setError("Failed to make move")
      return
    }

    // Update local state optimistically
    setGame((prev) => ({
      ...prev,
      board: newBoard,
      current_turn: newStatus === "finished" ? null : nextTurn,
      status: newStatus,
      winner: winner ? currentUserId : null,
      is_draw: isDraw,
    }))

    // Update stats if game finished
    if (newStatus === "finished") {
      updateStats(winner ? currentUserId : null, isDraw)
    }
  }

  async function updateStats(winnerId: string | null, isDraw: boolean) {
    if (isDraw) {
      // Update both players' draws
      await Promise.all([
        supabase.from("profiles").update({ draws: (game.player_x_profile?.draws || 0) + 1 }).eq("id", game.player_x),
        game.player_o && supabase.from("profiles").update({ draws: (game.player_o_profile?.draws || 0) + 1 }).eq("id", game.player_o),
      ])
    } else if (winnerId) {
      const loserId = winnerId === game.player_x ? game.player_o : game.player_x
      const winnerProfile = winnerId === game.player_x ? game.player_x_profile : game.player_o_profile
      const loserProfile = loserId === game.player_x ? game.player_x_profile : game.player_o_profile

      await Promise.all([
        supabase.from("profiles").update({ wins: (winnerProfile?.wins || 0) + 1 }).eq("id", winnerId),
        loserId && supabase.from("profiles").update({ losses: (loserProfile?.losses || 0) + 1 }).eq("id", loserId),
      ])
    }
  }

  async function createRematch() {
    const { data: newGame, error } = await supabase
      .from("games")
      .insert({
        player_x: game.player_o, // Swap who goes first
        player_o: game.player_x,
        status: "playing",
        current_turn: game.player_o, // New X (was O) goes first
      })
      .select()
      .single()

    if (error || !newGame) {
      setError("Failed to create rematch")
      return
    }

    router.push(`/game/${newGame.id}`)
  }

  const canMakeMove = game.status === "playing" && isMyTurn && (isPlayerX || isPlayerO)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Tic Tac Toe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <GameStatus
              status={game.status}
              currentTurnId={game.current_turn}
              currentUserId={currentUserId}
              playerX={game.player_x_profile || null}
              playerO={game.player_o_profile || null}
              winner={game.winner}
              isDraw={game.is_draw}
            />

            <GameBoard
              board={game.board}
              onCellClick={makeMove}
              disabled={!canMakeMove}
              currentPlayer={currentPlayer}
            />

            {game.status === "waiting" && isPlayerX && (
              <InviteLink gameId={game.id} />
            )}

            {game.status === "finished" && (isPlayerX || isPlayerO) && (
              <Button onClick={createRematch} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
            )}

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
