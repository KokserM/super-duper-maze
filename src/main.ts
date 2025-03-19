import 'phaser';
import { MainScene } from './scenes/MainScene';
import { WinScene } from './scenes/WinScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  parent: 'game',
  backgroundColor: '#1F2937',
  scene: [MainScene, WinScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  disableContextMenu: true,
  banner: false,
  render: {
    pixelArt: true,
    antialias: false
  }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  
  // Add global error handler for debugging
  window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
  });
}); 