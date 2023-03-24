import LineProgress from 'phaser3-rex-plugins/plugins/lineprogress.js';
import io from 'socket.io-client';

import { BaseScene } from './BaseScene';
const SOCKET_URL = 'http://localhost:3000';

const PROGRESS_BOX_WIDTH = 210;
const PROGRESS_BOX_HEIGHT = 30;

const COLOR_PRIMARY = 0xa42337;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class PreloaderScene extends BaseScene {
  private lineProgress: LineProgress;

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
    this.lineProgress = new LineProgress(this, {
      valuechangeCallback(newValue): void {
        console.log(`[Progress] ${newValue}%`);
      },
      x: canvasWidth * 0.5,
      y: canvasHeight * 0.5,
      width: PROGRESS_BOX_WIDTH,
      height: PROGRESS_BOX_HEIGHT,
      barColor: COLOR_PRIMARY,
      trackColor: COLOR_DARK,
      trackStrokeColor: COLOR_LIGHT
    });
    this.add.existing(this.lineProgress);
    this.add
      .graphics({
        lineStyle: {
          width: 2,
          color: 0xff0000,
          alpha: 1
        }
      })
      .strokeRectShape(this.lineProgress.getBounds());

    this.load.on('progress', (value: number) => {
      this.lineProgress.setValue(value);
    });

    // Remove progress bar and start game
    this.load.on('complete', () => {
      const socket = io(SOCKET_URL);

      socket.on('connect', () => {
        this.lineProgress.destroy();

        // Store the geckos connection in the registry
        this.registry.set('socket', socket);
        this.startTransition('Splash');
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
