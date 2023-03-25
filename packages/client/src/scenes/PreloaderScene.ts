import io from 'socket.io-client';

import RoundedProgressBar from '../components/RoundedProgressBar';
import AudioKey from '../constants/AudioKey';
import FontKey from '../constants/FontKey';
import HellPongGame from '../Game';
const SOCKET_URL = 'http://localhost:3000';

export default class PreloaderScene extends Phaser.Scene {
  private lineProgress: RoundedProgressBar;

  constructor() {
    super('Preloader');
  }

  public preload() {
    this.loadFonts();
    this.loadTextures();
    this.loadAudios();

    // Create progress bar
    const canvasWidth = this.sys.game.canvas.width;
    const canvasHeight = this.sys.game.canvas.height;
    this.lineProgress = new RoundedProgressBar(
      this,
      canvasWidth * 0.5,
      canvasHeight * 0.5
    );

    this.load.on('progress', (value: number) => {
      this.lineProgress.setValue(value);
    });

    this.load.on('complete', () => {
      const socket = io(SOCKET_URL);

      socket.on('connect', () => {
        // Store the geckos connection in the registry
        this.registry.set('socket', socket);
        (this.game as HellPongGame).startTransition(this, 'Splash');
      });
    });
  }

  private loadTextures() {
    this.load.atlas(
      'textures',
      'assets/textures/pong_textures.png',
      'assets/textures/pong_textures.json'
    );
  }

  private loadAudios() {
    this.load.audio(AudioKey.MainTheme, 'assets/sounds/main_theme.ogg');
    this.load.audio(AudioKey.LobbyTheme, 'assets/sounds/lobby.mp3');
    this.load.audio(AudioKey.SplashLogo, 'assets/sounds/splash.mp3');
    this.load.audio(AudioKey.MenuSelect, 'assets/sounds/menu_select.wav');
    this.load.audio(AudioKey.StartGame, 'assets/sounds/start_game.mp3');
    this.load.audio(AudioKey.PaddleHit, 'assets/sounds/paddle_hit.wav');
    this.load.audio(AudioKey.BallHit, 'assets/sounds/ball_hit.wav');
  }

  private loadFonts() {
    this.loadFont(FontKey.Text, 'assets/fonts/rexlia.otf');
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
