import { GAME_FPS, GAME_HEIGHT, GAME_WIDTH } from '@hell-pong/shared/constants';
import { Scale, Types } from 'phaser';
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin';

import GameScene from './scenes/GameScene';
import LobbyScene from './scenes/LobbyScene';
import MainScene from './scenes/main/MainScene';
import PreloaderScene from './scenes/preloader/PreloaderScene';
import SplashScene from './scenes/SplashScene';

const GameConfig: Types.Core.GameConfig = {
  parent: 'game-container',
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  fps: {
    target: GAME_FPS,
    forceSetTimeOut: true
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH
  },
  pixelArt: true,
  disableContextMenu: true,
  scene: [PreloaderScene, SplashScene, MainScene, LobbyScene, GameScene],
  physics: {
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
export default GameConfig;
