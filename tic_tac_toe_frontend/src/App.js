import React, { useState } from "react";
import "./App.css";

// Utility function to check winner
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /**
   * Checks board for a winner. Returns 'X', 'O', or null.
   */
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
const AI_NAME = "AI";
/**
 * Returns AI's move as an index, or null if board is full.
 * Naive: take first available, but blocks or wins if available.
 */
function aiMove(squares, aiMarker, playerMarker) {
  // 1. Win if possible
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = aiMarker;
      if (calculateWinner(copy) === aiMarker) return i;
    }
  }
  // 2. Block opponent
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = playerMarker;
      if (calculateWinner(copy) === playerMarker) return i;
    }
  }
  // 3. Take center
  if (!squares[4]) return 4;
  // 4. Take first empty
  for (let i=0; i<9; ++i) if (!squares[i]) return i;
  return null;
}

// PUBLIC_INTERFACE
function GameBoard({ squares, onClick, disabled }) {
  /**
   * Minimalistic tic-tac-toe board (3x3 grid).
   * @param squares Array of 9 'X', 'O', or null
   * @param onClick Called with index when user clicks
   * @param disabled Board is locked if true
   */
  return (
    <div className="ttt-board">
      {squares.map((val, i) => (
        <button
          aria-label={`Cell ${i+1}`}
          key={i}
          className="ttt-cell"
          onClick={() => onClick(i)}
          disabled={disabled || !!val}
        >
          {val}
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
const modes = [
  { label: "2 Players", value: "PVP" },
  { label: "Play vs AI", value: "AI" },
];

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Main App: Manages game state and rendering for Tic Tac Toe.
   */
  // Board state: Array(9)
  const [squares, setSquares] = useState(Array(9).fill(null));
  // X goes first
  const [xIsNext, setXIsNext] = useState(true);
  // Game mode: PVP or AI
  const [mode, setMode] = useState("PVP");
  // Was last turn by player (used to delay AI move)
  const [waitingAI, setWaitingAI] = useState(false);

  // Status
  const winner = calculateWinner(squares);
  const turnFull = winner
    ? winner === "X"
      ? "Player 1 wins!"
      : mode === "AI" && !xIsNext
        ? `${AI_NAME} wins!`
        : "Player 2 wins!"
    : squares.every(Boolean)
      ? "It's a draw."
      : mode === "AI"
        ? xIsNext
          ? "Your turn"
          : "AI's turn"
        : xIsNext
          ? "Player 1's turn"
          : "Player 2's turn";

  // Player markers
  const playerMarker = "X";
  const aiMarker = "O";

  // Handle board click
  function handleClick(i) {
    if (winner || squares[i]) return;
    if (mode === "AI" && !xIsNext) return; // User can't go if it's AI's turn
    const next = squares.slice();
    next[i] = xIsNext ? playerMarker : aiMarker;
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // Handle AI move when needed
  React.useEffect(() => {
    if (mode === "AI" && !winner && !xIsNext) {
      setWaitingAI(true);
      const timeout = setTimeout(() => {
        const aiIdx = aiMove(squares, aiMarker, playerMarker);
        if (aiIdx !== null) {
          const next = squares.slice();
          next[aiIdx] = aiMarker;
          setSquares(next);
          setXIsNext(true);
        }
        setWaitingAI(false);
      }, 420); // Small delay for realism
      return () => clearTimeout(timeout);
    }
  }, [mode, xIsNext, winner, squares]);

  // Start/restart game
  function startNewGame(selectedMode = mode) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setMode(selectedMode);
  }

  // When mode changes, restart game automatically
  function handleModeChange(e) {
    const value = e.target.value;
    setMode(value);
    startNewGame(value);
  }

  return (
    <main className="ttt-app-root">
      <h1 className="ttt-title">Tic Tac Toe</h1>
      <div className="ttt-controls">
        <select value={mode} onChange={handleModeChange} className="ttt-select" aria-label="Game mode">
          {modes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="ttt-restart" onClick={() => startNewGame(mode)}>
          New Game
        </button>
      </div>
      <div className="ttt-centerer">
        <GameBoard
          squares={squares}
          onClick={handleClick}
          disabled={Boolean(winner) || waitingAI || (mode === "AI" && !xIsNext)}
        />
      </div>
      <div className="ttt-status">{turnFull}</div>
    </main>
  );
}
