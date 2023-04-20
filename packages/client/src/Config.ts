import { GameConstant } from '@hell-pong/shared/constants/game';
import { AUTO, Scale, Types } from 'phaser';
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';

import GameScene from './scenes/GameScene';
import LobbyScene from './scenes/lobby/LobbyScene';
import MainScene from './scenes/main/MainScene';
import PreloaderScene from './scenes/preloader/PreloaderScene';
import SettingsScene from './scenes/settings/SettingsScene';
import SplashScene from './scenes/splash/SplashScene';

const GameConfig: Types.Core.GameConfig = {
  parent: 'game',
  type: AUTO,
  width: GameConstant.Width,
  height: GameConstant.Height,
  fps: {
    target: GameConstant.FPS,
    forceSetTimeOut: true
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH
  },
  pixelArt: true,
  disableContextMenu: true,
  scene: [PreloaderScene, SplashScene, MainScene, SettingsScene, LobbyScene, GameScene],
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
      }
    ]
  }
};
export default GameConfig;
