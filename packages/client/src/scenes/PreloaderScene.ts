import Phaser from 'phaser';
import io from 'socket.io-client';
const SOCKET_URL = 'http://localhost:3000';

export default class PreloaderScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super('Preloader');
  }

  preload() {
    // Create progress bar
    const canvasWidth = this.sys.game.canvas.width
    const canvasHeight = this.sys.game.canvas.height

    // Load fonts
    this.load.bitmapFont(
      "retro_font",
      "assets/fonts/retro_font.png",
      "assets/fonts/retro_font.xml"
    );
    this.loadFont('arcade-zig', 'assets/fonts/zig.ttf');
    this.loadFont('arcade-rexlia', 'assets/fonts/rexlia.otf');
    this.loadFont('arcade-chargen', 'assets/fonts/chargen.ttf');

    // // Load the assets
    this.load.atlas('textures', 'assets/textures/pong_textures.png', 'assets/textures/pong_textures.json');
    this.load.audio('click', 'assets/sounds/click.ogg');
    this.load.audio('main_theme', 'assets/sounds/main_theme.ogg');

    // // Show progress bar
    this.progressBar = this.add.graphics()
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x000, 0.5)
    this.progressBox.fillRect((canvasWidth / 2) - (210 / 2), (canvasHeight / 2) - 5, 210, 30)

    this.load.on('progress', (value: number) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(0xFFBD19, 1)
      this.progressBar.fillRect((canvasWidth / 2) - (200 / 2), (canvasHeight / 2), 200 * value, 20)
    })

    // Remove progress bar and start game
    this.load.on('complete', () => {
      const socket = io(SOCKET_URL);

      socket.on('connect', () => {
        console.log('[PreloaderScene:complete] Connected to socket server');

        this.progressBar.destroy();
        this.progressBox.destroy();
        this.scene.stop('Preloader')
        this.cameras.main.setBackgroundColor("#020079");

        // Store the geckos connection in the registry
        this.registry.set('socket', socket);
        this.scene.start('Main');
      });
    });
  }

  loadFont(name: string, url: string) {
    // @ts-ignore
    this.load.rexAwait(async (successCallback, failureCallback) => {
      try {
        const font = new FontFace(name, `url(${url})`);
        await font.load();
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

