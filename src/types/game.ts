export type CellType = 'wall' | 'path' | 'start' | 'goal';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  visited?: boolean;
}

export interface MazeConfig {
  width: number;
  height: number;
  cellSize: number;
}

export interface PlayerState {
  x: number;
  y: number;
  isMoving: boolean;
}

export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right'; 