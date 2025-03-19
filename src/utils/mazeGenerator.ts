import { Cell, CellType } from '../types/game';

export class MazeGenerator {
  private maze: Cell[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.maze = [];
  }

  generate(): Cell[][] {
    // Initialize maze with walls
    for (let y = 0; y < this.height; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.maze[y][x] = {
          x,
          y,
          type: 'wall',
          visited: false
        };
      }
    }

    // Start from a random point
    const startX = 1;
    const startY = 1;
    this.maze[startY][startX].type = 'start';
    this.maze[startY][startX].visited = true;

    // Generate maze using recursive backtracking
    this.carve(startX, startY);

    // Set goal at the farthest point from start
    const goalPos = this.findFarthestPoint(startX, startY);
    this.maze[goalPos.y][goalPos.x].type = 'goal';

    return this.maze;
  }

  private carve(x: number, y: number) {
    const directions = [
      [0, -2], // Up
      [2, 0],  // Right
      [0, 2],  // Down
      [-2, 0]  // Left
    ];
    
    // Shuffle directions
    directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValidCell(newX, newY) && !this.maze[newY][newX].visited) {
        // Mark the cell and the cell between as path
        this.maze[y + dy/2][x + dx/2].type = 'path';
        this.maze[newY][newX].type = 'path';
        this.maze[newY][newX].visited = true;
        
        this.carve(newX, newY);
      }
    }
  }

  private isValidCell(x: number, y: number): boolean {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
  }

  private findFarthestPoint(startX: number, startY: number): { x: number, y: number } {
    // Use BFS to find the farthest point
    const queue: Array<[number, number, number]> = [[startX, startY, 0]];
    const visited = new Set<string>();
    let farthestPoint = { x: startX, y: startY };
    let maxDistance = 0;

    while (queue.length > 0) {
      const [x, y, distance] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (distance > maxDistance && this.maze[y][x].type === 'path') {
        maxDistance = distance;
        farthestPoint = { x, y };
      }

      // Check all adjacent cells
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        if (this.isValidCell(newX, newY) && this.maze[newY][newX].type === 'path') {
          queue.push([newX, newY, distance + 1]);
        }
      }
    }

    return farthestPoint;
  }
} 