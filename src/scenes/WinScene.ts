import { Scene } from 'phaser';

export class WinScene extends Scene {
  private overlay!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'WinScene' });
  }

  create() {
    this.setupUI();
    
    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  private setupUI() {
    const { width, height } = this.scale;

    // Create background overlay
    this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    this.overlay.setOrigin(0);

    // Win text
    this.text = this.add.text(width / 2, height / 2 - 50, 'You Win!', {
      fontSize: '32px',
      color: '#ffffff'
    });
    this.text.setOrigin(0.5);

    // Play Again button
    this.restartButton = this.add.text(width / 2, height / 2 + 50, 'Play Again', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#4F46E5',
      padding: { x: 20, y: 10 }
    });
    this.restartButton.setOrigin(0.5);
    this.restartButton.setInteractive({ useHandCursor: true });
    
    // Handle button click - completely restart the game
    this.restartButton.on('pointerdown', () => {
      console.log('Play Again button clicked');
      
      // Cleanup this scene
      this.scale.off('resize', this.handleResize, this);
      
      // Stop this scene first
      this.scene.stop();
      
      // Resume MainScene
      this.scene.resume('MainScene');
      
      // A simpler approach: stop all current scenes and start MainScene fresh
      this.scene.start('MainScene');
    });
  }

  private handleResize() {
    const { width, height } = this.scale;
    
    // Update overlay size
    this.overlay.setSize(width, height);
    
    // Reposition text and button
    this.text.setPosition(width / 2, height / 2 - 50);
    this.restartButton.setPosition(width / 2, height / 2 + 50);
  }

  shutdown() {
    // Clean up resources
    this.scale.off('resize', this.handleResize, this);
  }
} 