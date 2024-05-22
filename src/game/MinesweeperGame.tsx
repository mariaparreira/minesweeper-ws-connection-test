import { useState, useEffect, useRef } from "react";
import { MinesweeperConfig } from "../App";
import { NumberDisplay } from "../number_display/NumberDisplay";

import '../App.css';
import './MinesweeperGame.css';
import './GameBoard.css';

import { GameBoard } from "./GameBoard";

export type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

export enum Face {
  upsideDownSmile = "🙃",
  smile = "🙂",
  won = "🥳",
  lost = "🥺"
}

export interface MinesweeperProps {
  minesweeperConfig: MinesweeperConfig;
  board: Cell[][];
  onCellClick: (row: number, col: number) => void;
  onCellContext: (row: number, col: number) => void;
}

// This function generates an initial empty board with the given rows and columns
export const generateCells = (rows: number, cols: number): Cell[][] => {
  const cells: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      });
    }
    cells.push(rowCells);
  }
  return cells;
};


export const MinesweeperGame: React.FC<MinesweeperProps> = ({ minesweeperConfig, onCellClick, onCellContext }) => {
  const { rows, columns, mines, gridClass } = minesweeperConfig;
  const [minesCounter, setMinesCounter] = useState<number>(mines);
  const [cells, setCells] = useState(generateCells(rows, columns));
  const [face, setFace] = useState<Face>(Face.smile);
  const [timer, setTimer] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);

  const gameBoardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = () => {
        setFace(Face.upsideDownSmile);
    };

    const handleMouseUp = () => {
        setFace(Face.smile);
    }

    const gameBoardElement = gameBoardRef.current;
    if (gameBoardElement) {
        gameBoardElement.addEventListener("mousedown", handleMouseDown);
        gameBoardElement.addEventListener("mouseup", handleMouseUp);

        return () => {
            gameBoardElement.removeEventListener("mousedown", handleMouseDown);
            gameBoardElement.removeEventListener("mouseup", handleMouseUp);
        };
    }
  }, []);


  useEffect(() => {
    setTimer(0);
    setLive(false);
    setMinesCounter(mines);
    setCells(generateCells(rows, columns));
  }, [mines, rows, columns]);

  useEffect(() => {
      if (live && timer < 999) {
          const time = setInterval(() => {
              setTimer(timer + 1);
          }, 1000);
          
          return () => {
              clearInterval(time);
          };
      }
  }, [live, timer]);

  const handleRestartGame = () => {
    setMinesCounter(mines);
    setTimer(0);
    setCells(generateCells(rows, columns));
    setFace(Face.smile);
    // Logic to restart the game by re-initializing the board, typically by notifying the backend
  };

  const handleCellClick = (row: number, col: number) => {
    onCellClick(row, col);
  };

  const handleCellContext = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    onCellContext(row, col);
  };

  return (
    <div className="minesweeper-board">
      <div className="game-app">
        <div className="game-header">
          <NumberDisplay value={minesCounter} />
          <button className="emoji" onClick={handleRestartGame}>
            {face}
          </button>
          <NumberDisplay value={timer} />
        </div>
        <div ref={gameBoardRef} className={`game-board ${gridClass}`}>
          {cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <GameBoard
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContext={(e) => handleCellContext(e, rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
