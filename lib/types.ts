export type GameStatus = "waiting" | "playing" | "finished"

export interface Profile {
  id: string
  username: string
  wins: number
  losses: number
  draws: number
  created_at: string
}

export interface Game {
  id: string
  player_x: string
  player_o: string | null
  board: string[]
  current_turn: string | null
  status: GameStatus
  winner: string | null
  is_draw: boolean
  created_at: string
  updated_at: string
  // Joined data
  player_x_profile?: Profile
  player_o_profile?: Profile
}

export type Player = "X" | "O"

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal
  [2, 4, 6], // anti-diagonal
]

export function checkWinner(board: string[]): { winner: Player | null; winningLine: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, winningLine: combo }
    }
  }
  return { winner: null, winningLine: null }
}

export function checkDraw(board: string[]): boolean {
  return board.every((cell) => cell !== "") && !checkWinner(board).winner
}
