"use client"

import { cn } from "@/lib/utils"
import { checkWinner } from "@/lib/types"

interface GameBoardProps {
  board: string[]
  onCellClick: (index: number) => void
  disabled: boolean
  currentPlayer: "X" | "O"
}

export function GameBoard({ board, onCellClick, disabled, currentPlayer }: GameBoardProps) {
  const { winningLine } = checkWinner(board)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onCellClick(index)}
          disabled={disabled || cell !== ""}
          className={cn(
            "flex aspect-square items-center justify-center rounded-lg border-2 text-4xl font-bold transition-all sm:text-6xl md:text-7xl",
            "bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            cell === "" && !disabled && "cursor-pointer hover:border-primary/50",
            cell === "" && disabled && "cursor-not-allowed opacity-50",
            cell !== "" && "cursor-default",
            winningLine?.includes(index) && "bg-primary/10 border-primary",
            cell === "X" && "text-game-x",
            cell === "O" && "text-game-o"
          )}
          aria-label={cell ? `Cell ${index + 1}: ${cell}` : `Cell ${index + 1}: empty`}
        >
          {cell || (
            <span className={cn(
              "opacity-0 transition-opacity",
              cell === "" && !disabled && "group-hover:opacity-20",
              currentPlayer === "X" ? "text-game-x" : "text-game-o"
            )}>
              {currentPlayer}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
