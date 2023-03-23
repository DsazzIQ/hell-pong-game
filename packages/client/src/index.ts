import { GAME_FPS, GAME_HEIGHT, GAME_WIDTH } from '@hell-pong/shared/constants';
import Phaser from 'phaser';
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin';

import GameScene from './scenes/GameScene';
import LobbyScene from './scenes/LobbyScene';
import MainScene from './scenes/MainScene';
import PreloaderScene from './scenes/PreloaderScene';
import { SplashScene } from './scenes/SplashScene';

const config: Phaser.Types.Core.GameConfig = {
  parent: 'game-container',
  // type: Phaser.AUTO,
  type: Phaser.WEBGL,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  fps: {
    target: GAME_FPS,
    forceSetTimeOut: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
    //     max: {
    //         width: 1920,
    //         height: 1080
    //     },
  },
  pixelArt: true,
  backgroundColor: '#222222',
  disableContextMenu: true,
  scene: [PreloaderScene, SplashScene, MainScene, LobbyScene, GameScene],
  physics: {
    // default: 'arcade',
    // arcade: {
    //     debug: true // set to true to display physics bodies and debug information
    // }
    default: 'matter',
    matter: {
      debug: true // Set to false in production
    }
  },
  plugins: {
    global: [
      {
        key: 'rexAwaitLoader',
        plugin: AwaitLoaderPlugin,
        start: true
      },
      {
        key: 'rexGlowFilterPipeline',
        plugin: GlowFilterPipelinePlugin,
        start: true
      }
    ]
  }
};

new Phaser.Game(config);
