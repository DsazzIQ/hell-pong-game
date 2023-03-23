import Phaser from 'phaser';
import io from 'socket.io-client';

import { BaseScene } from './BaseScene';
const SOCKET_URL = 'http://localhost:3000';

const PROGRESS_BOX_WIDTH = 210;
const PROGRESS_BOX_HEIGHT = 30;
const PROGRESS_BOX_PADDING = 10;
const PROGRESS_BAR_WIDTH = PROGRESS_BOX_WIDTH - PROGRESS_BOX_PADDING;
const PROGRESS_BAR_HEIGHT = PROGRESS_BOX_HEIGHT - PROGRESS_BOX_PADDING;

export default class PreloaderScene extends BaseScene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super('Preloader');
  }

  public preload() {
    // Create progress bar
    const canvasWidth = this.sys.game.canvas.width;
    const canvasHeight = this.sys.game.canvas.height;

    // Load fonts
    this.load.bitmapFont(
      'retro_font',
      'assets/fonts/retro_font.png',
      'assets/fonts/retro_font.xml'
    );
    this.loadFont('arcade-zig', 'assets/fonts/zig.ttf');
    this.loadFont('arcade-rexlia', 'assets/fonts/rexlia.otf');
    this.loadFont('arcade-chargen', 'assets/fonts/chargen.ttf');

    // Load the assets
    this.load.atlas(
      'textures',
      'assets/textures/pong_textures.png',
      'assets/textures/pong_textures.json'
    );
    this.load.audio('click', 'assets/sounds/click.ogg');
    this.load.audio('main_theme', 'assets/sounds/main_theme.ogg');

    // // Create progress bar
    this.progressBar = this.add.graphics();
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x000, 0.5);
    this.progressBox.fillRect(
      canvasWidth * 0.5 - PROGRESS_BOX_WIDTH * 0.5,
      canvasHeight * 0.5 - PROGRESS_BOX_PADDING * 0.5,
      PROGRESS_BOX_WIDTH,
      PROGRESS_BOX_HEIGHT
    );

    this.percentText = this.add.text(
      canvasWidth * 0.5,
      canvasHeight * 0.5 + PROGRESS_BOX_PADDING * 0.5,
      '0%',
      {
        fontSize: '15px monospace',
        color: '#ffffff'
      }
    );

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffbd19, 1);
      this.progressBar.fillRect(
        canvasWidth * 0.5 - PROGRESS_BAR_WIDTH * 0.5,
        canvasHeight * 0.5,
        PROGRESS_BAR_WIDTH * value,
        PROGRESS_BAR_HEIGHT
      );

      this.percentText.setText(`${value * 100}%`);
    });

    // Remove progress bar and start game
    this.load.on('complete', () => {
      const socket = io(SOCKET_URL);

      socket.on('connect', () => {
        this.progressBar.destroy();
        this.progressBox.destroy();
        this.percentText.destroy();

        // this.scene.stop('Preloader');
        //
        // this.cameras.main.setBackgroundColor('#020079');

        // Store the geckos connection in the registry
        this.registry.set('socket', socket);
        this.startTransition('Splash');
        // this.scene.start('Splash');
      });
    });
  }

  private loadFont(name: string, url: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.load.rexAwait(async (successCallback, failureCallback) => {
      try {
        const font = new FontFace(name, `url(${url})`);
        await font.load();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        document.fonts.add(font);
        document.body.classList.add('fonts-loaded');
        successCallback();
      } catch (e) {
        failureCallback();
      }
    });
  }
}
