import React from "react";

import '../App.css';
import './MinesweeperGame.css';
import './GameBoard.css';

import { Cell } from "./MinesweeperGame";

export interface GameBoardProps {
    cell: Cell;
    onClick: () => void;
    onContext: (e: React.MouseEvent) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ cell, onClick, onContext }) => {
    const renderContent = (): React.ReactNode => {
        if (cell.isRevealed && cell.isMine) {
            return <span role="img" aria-label="mine">💣</span>;
        } else if (cell.isRevealed && cell.adjacentMines > 0) {
            return <span className={`adjacent-${cell.adjacentMines}`}>{cell.adjacentMines}</span>;
        } else if (cell.isFlagged) {
            return <span role="img" aria-label="flag">🚩</span>;
        }
        return null;
    };

    return (
        <div
            className={`board ${cell.isRevealed ? "revealed" : ""}`}
            onClick={onClick}
            onContextMenu={onContext}
        >
            {renderContent()}
        </div>
    );
};
