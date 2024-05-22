import { useRef, useState } from "react";
import "./App.css";
import { Cell, MinesweeperGame } from "./game/MinesweeperGame";

export type Level = "easy" | "medium" | "expert";

export type Cell2 = "unrevealed" | "flag" | "empty" | "mine" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Field = {
  rows: number;
  columns: number;
  cells?: Cell2[][];
  mines: number;
};

export type Minesweeper = Field & {
  gameId: string;
  playerName: string;
};

export type MinesweeperConfig = Minesweeper & { gridClass: string };

const fields: Record<Level, Field> = {
  easy: {
    rows: 8,
    columns: 8,
    mines: 10,
  },
  medium: {
    rows: 16,
    columns: 16,
    mines: 40,
  },
  expert: {
    rows: 30,
    columns: 16,
    mines: 99,
  },
};

export const App = () => {
  const [minesweeperConfig, setMinesweeperConfig] = useState<MinesweeperConfig | null>(null);
  const [board, setBoard] = useState<Cell[][]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const handleDifficultyClick = (level: Level) => {
    let playerName = null;

    do {
      playerName = window.prompt("Enter your name:");
    } while (!playerName);

    fetch(`http://127.0.0.1:8000/game/create/${level}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok...");
        }
        return response.json();
      })
      .then((data: string) => {
        const gameIndex = data.lastIndexOf(":") + 2;
        const gameId = data.substring(gameIndex);

        const ws = new WebSocket(`ws://127.0.0.1:8000/game/connect/${gameId}`);

        ws.onopen = () => {
          console.log("Websocket connection established!");
          wsRef.current = ws;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received message from server:", message);
            if (message.board) {
              console.log("Received board:", message.board);
              setBoard(message.board);
            }
          } catch (err) {
            console.error(event.data);
          }
        };        

        ws.onerror = (error) => {
          console.log("Websocket error:", error);
        };

        ws.onclose = () => {
          console.log("Websocket connection closed.");
        };

        setMinesweeperConfig({
          ...fields[level],
          playerName,
          gameId,
          gridClass: `${level}-grid`,
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const handleCellClick = (row: number, col: number) => {
    if (!wsRef.current) return;

    wsRef.current.send(JSON.stringify({ action: "reveal", row: row, col: col }));
  };

  const handleCellContext = (row: number, col: number) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: "flag", row, col }));
    }
  };

  return (
    <>
      <h1>M<b className="ines-style">ines</b>weeper</h1>

      {!minesweeperConfig && (
        <div className="choose-level">
          <button className="level" onClick={() => handleDifficultyClick("easy")}>Easy</button>
          <button className="level" onClick={() => handleDifficultyClick("medium")}>Medium</button>
          <button className="level" onClick={() => handleDifficultyClick("expert")}>Expert</button>
        </div>
      )}

      {minesweeperConfig && (
        <MinesweeperGame
          minesweeperConfig={minesweeperConfig}
          board={board}
          onCellClick={handleCellClick}
          onCellContext={handleCellContext}
        />
      )}
    </>
  );
}

export default App;
