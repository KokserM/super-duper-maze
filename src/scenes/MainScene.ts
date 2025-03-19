import { Scene } from 'phaser';
import { MazeGenerator } from '../utils/mazeGenerator';
import { Cell, PlayerState, Direction } from '../types/game';

export class MainScene extends Scene {
  private maze!: Cell[][];
  private player!: Phaser.GameObjects.Sprite;
  private playerState!: PlayerState;
  private goal!: Phaser.GameObjects.Sprite;
  private mazeGraphics!: Phaser.GameObjects.Graphics;
  private readonly cellSize = 32;
  private readonly mazeWidth = 15;
  private readonly mazeHeight = 15;
  private isMoving = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('goal', 'assets/goal.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('wall', 'assets/wall.png');
    this.load.image('floor', 'assets/floor.png');
  }

  create() {
    // Generate new maze
    const generator = new MazeGenerator(this.mazeWidth, this.mazeHeight);
    this.maze = generator.generate();

    // Create maze graphics
    this.mazeGraphics = this.add.graphics();
    this.drawMaze();

    // Find start position
    const startPos = this.findCellOfType('start');
    
    // Create player
    this.player = this.add.sprite(
      startPos.x * this.cellSize + this.cellSize / 2,
      startPos.y * this.cellSize + this.cellSize / 2,
      'player'
    );
    
    this.playerState = {
      x: startPos.x,
      y: startPos.y,
      isMoving: false
    };

    // Create animations
    this.createAnimations();

    // Find and create goal
    const goalPos = this.findCellOfType('goal');
    this.goal = this.add.sprite(
      goalPos.x * this.cellSize + this.cellSize / 2,
      goalPos.y * this.cellSize + this.cellSize / 2,
      'goal'
    );

    // Add goal animation
    this.tweens.add({
      targets: this.goal,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Setup input
    this.setupInput();
  }

  private createAnimations() {
    // Player animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // Start playing idle animation
    this.player.play('idle');
  }

  private setupInput() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    keyboard.on('keydown-UP', () => this.movePlayer('up'));
    keyboard.on('keydown-DOWN', () => this.movePlayer('down'));
    keyboard.on('keydown-LEFT', () => this.movePlayer('left'));
    keyboard.on('keydown-RIGHT', () => this.movePlayer('right'));
  }

  private movePlayer(direction: Direction) {
    if (this.isMoving) return;

    const { x, y } = this.playerState;
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY--;
        break;
      case 'down':
        newY++;
        break;
      case 'left':
        newX--;
        break;
      case 'right':
        newX++;
        break;
    }

    // Check if move is valid
    if (this.isValidMove(newX, newY)) {
      this.isMoving = true;
      this.player.play('walk');

      // Move player with tween
      this.tweens.add({
        targets: this.player,
        x: newX * this.cellSize + this.cellSize / 2,
        y: newY * this.cellSize + this.cellSize / 2,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
          this.isMoving = false;
          this.player.play('idle');
          this.playerState.x = newX;
          this.playerState.y = newY;
          this.checkWinCondition();
        }
      });
    }
  }

  private isValidMove(x: number, y: number): boolean {
    return (
      x >= 0 &&
      x < this.mazeWidth &&
      y >= 0 &&
      y < this.mazeHeight &&
      this.maze[y][x].type !== 'wall'
    );
  }

  private drawMaze() {
    this.mazeGraphics.clear();

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const xPos = x * this.cellSize;
        const yPos = y * this.cellSize;

        if (cell.type === 'wall') {
          this.add.image(xPos + this.cellSize / 2, yPos + this.cellSize / 2, 'wall');
        } else {
          this.add.image(xPos + this.cellSize / 2, yPos + this.cellSize / 2, 'floor');
        }
      }
    }
  }

  private findCellOfType(type: 'start' | 'goal'): { x: number; y: number } {
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y][x].type === type) {
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 }; // Fallback, should never happen
  }

  private checkWinCondition() {
    const goalPos = this.findCellOfType('goal');
    if (this.playerState.x === goalPos.x && this.playerState.y === goalPos.y) {
      this.showWinMessage();
    }
  }

  private showWinMessage() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);

    const text = this.add.text(width / 2, height / 2 - 50, 'You Win!', {
      fontSize: '32px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);

    const restartButton = this.add.text(width / 2, height / 2 + 50, 'Play Again', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#4F46E5',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerdown', () => {
      overlay.destroy();
      text.destroy();
      restartButton.destroy();
      this.scene.restart();
    });
  }
} 