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
  
  // Properties to store the selected textures
  private currentFloorTexture: string = 'floor';
  private currentWallTexture: string = 'wall';

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load player and goal assets
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('goal', 'assets/goal.png', { frameWidth: 32, frameHeight: 32 });
    
    // Load multiple floor textures
    this.load.image('floor', 'assets/floor.png');
    this.load.image('floor1', 'assets/floor2.png');
    this.load.image('floor2', 'assets/floor3.png');
    
    // Load multiple wall textures
    this.load.image('wall', 'assets/wall.png');
    this.load.image('wall1', 'assets/wall2.png');
    this.load.image('wall2', 'assets/wall3.png');
  }

  create() {
    console.log('MainScene create called');
    
    // Make sure any existing tweens are stopped
    this.tweens.killAll();
    
    // Select random textures for this maze
    this.selectRandomTextures();
    
    // Generate new maze
    const generator = new MazeGenerator(this.mazeWidth, this.mazeHeight);
    this.maze = generator.generate();

    // Clear any previous event listeners
    this.scale.off('resize', this.resize, this);
    this.scale.on('resize', this.resize, this);
    
    // Initial resize to set up the camera
    this.resize();

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
    // Clear any existing graphics
    this.mazeGraphics.clear();
    
    // Create a container for maze tiles so we can manage them better
    const mazeContainer = this.add.container(0, 0);
    
    // Store previous tiles if any, so we can destroy them
    const previousTiles = this.children.getAll().filter(child => 
      child instanceof Phaser.GameObjects.Image && 
      (child.texture.key.startsWith('wall') || child.texture.key.startsWith('floor'))
    );
    
    // Destroy previous tiles
    previousTiles.forEach(tile => tile.destroy());

    // Create new tiles
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const xPos = x * this.cellSize;
        const yPos = y * this.cellSize;

        let tileImage;
        if (cell.type === 'wall') {
          tileImage = this.add.image(xPos + this.cellSize / 2, yPos + this.cellSize / 2, this.currentWallTexture);
        } else {
          tileImage = this.add.image(xPos + this.cellSize / 2, yPos + this.cellSize / 2, this.currentFloorTexture);
        }
        
        // Add the tile to the container
        mazeContainer.add(tileImage);
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
      this.scene.launch('WinScene');
      this.scene.pause();
    }
  }

  private resize() {
    // Calculate the scaling factor to fit the maze on screen
    const width = this.scale.width;
    const height = this.scale.height;
    const aspectRatio = width / height;
    
    // Calculate the ideal size of our game area based on the maze dimensions
    const idealWidth = this.mazeWidth * this.cellSize;
    const idealHeight = this.mazeHeight * this.cellSize;
    const idealAspectRatio = idealWidth / idealHeight;

    let scale;
    if (aspectRatio > idealAspectRatio) {
      // Window is wider than the ideal aspect ratio
      scale = height / idealHeight;
    } else {
      // Window is taller than the ideal aspect ratio
      scale = width / idealWidth;
    }

    // Scale the game to fit the screen
    this.cameras.main.setZoom(scale * 0.9); // 90% to add a bit of margin
    this.cameras.main.centerOn(
      (this.mazeWidth * this.cellSize) / 2,
      (this.mazeHeight * this.cellSize) / 2
    );
  }

  shutdown() {
    console.log('MainScene shutdown called');
    
    // Clean up all resources when scene shuts down
    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-UP');
      this.input.keyboard.off('keydown-DOWN');
      this.input.keyboard.off('keydown-LEFT');
      this.input.keyboard.off('keydown-RIGHT');
    }
    
    // Remove resize listener
    this.scale.off('resize', this.resize, this);
    
    // Kill all tweens
    this.tweens.killAll();
    
    // Clear all timers
    this.time.removeAllEvents();
  }

  destroy() {
    // Final cleanup when scene is destroyed
    this.shutdown();
    this.maze = [];
  }

  init() {
    // Initialize properties when scene starts
    this.isMoving = false;
    
    // Ensure all game objects are cleared if we're restarting
    this.children.each((child) => {
      child.destroy();
    });
    
    // Clear all tweens
    this.tweens.killAll();
  }

  // Method to randomly select textures for the current maze
  private selectRandomTextures() {
    const floorTextures = ['floor', 'floor1', 'floor2'];
    const wallTextures = ['wall', 'wall1', 'wall2'];
    
    // Randomly select a floor texture
    this.currentFloorTexture = floorTextures[Math.floor(Math.random() * floorTextures.length)];
    
    // Randomly select a wall texture
    this.currentWallTexture = wallTextures[Math.floor(Math.random() * wallTextures.length)];
    
    console.log(`Selected textures: ${this.currentFloorTexture}, ${this.currentWallTexture}`);
  }
} 