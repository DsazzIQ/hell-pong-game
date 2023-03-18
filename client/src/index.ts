import Phaser from 'phaser';

import MainScene from './scenes/MainScene';
import LobbyScene from "./scenes/LobbyScene";
import PreloaderScene from "./scenes/PreloaderScene";
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import GameScene from "./scenes/GameScene";
import {GAME_HEIGHT, GAME_WIDTH} from "@shared/constants";

const config: Phaser.Types.Core.GameConfig = {
    parent: 'game-container',
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    // scale: {
    //     mode: Phaser.Scale.RESIZE,
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    //     max: {
    //         width: 1920,
    //         height: 1080
    //     },
    // },
    pixelArt: true,
    backgroundColor: '#222222',
    disableContextMenu: true,
    scene: [PreloaderScene, MainScene, LobbyScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true // set to true to display physics bodies and debug information
        }
    },
    plugins: {
        global: [
            {
                key: 'rexAwaitLoader',
                plugin: AwaitLoaderPlugin,
                start: true,
            },
        ],
    },
};

new Phaser.Game(config);
