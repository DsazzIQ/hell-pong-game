import io, { Socket } from 'socket.io-client';

import AudioKey from '../../constants/AudioKey';
import FontKey from '../../constants/FontKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import { SettingsController } from '../../entities/settings/SettingsController';
import Game from '../../Game';
import RoundedProgressBar from './components/RoundedProgressBar';
const SOCKET_URL = 'http://localhost:3000';

export default class PreloaderScene extends Phaser.Scene {
  private lineProgress: RoundedProgressBar;

  constructor() {
    super(SceneKey.Preloader);
  }

  public preload() {
    this.loadFonts();
    this.loadTextures();
    this.loadAudios();
    this.initProgressBar();
  }

  private initProgressBar() {
    this.lineProgress = new RoundedProgressBar(this);

    this.load.on('progress', (value: number) => this.lineProgress.setValue(value));

    const { startTransition } = this.game as Game;
    this.load.on('complete', () => {
      const socket = io(SOCKET_URL);

      socket.on('connect', () => {
        this.initRegistry(socket);

        //TODO commented for development
        startTransition(this, SceneKey.Splash);
        // startTransition(this, SceneKey.Main);
      });
    });
  }

  private initRegistry(socket: Socket) {
    this.registry.set(RegistryKey.Socket, socket);
    this.registry.set(RegistryKey.SettingsController, new SettingsController(this.game as Game));
  }

  private loadTextures() {
    this.load.atlas(TextureKey.Background.Key, TextureKey.Background.TextureUrl, TextureKey.Background.AtlasUrl);
    this.load.atlas(TextureKey.Gui.Key, TextureKey.Gui.TextureUrl, TextureKey.Gui.AtlasUrl);
  }

  private loadAudios() {
    this.load.audio(AudioKey.MainTheme, 'assets/sounds/main_theme.ogg');
    this.load.audio(AudioKey.SecondaryTheme, 'assets/sounds/secondary_theme.mp3');
    this.load.audio(AudioKey.SplashLogo, 'assets/sounds/splash.mp3');
    this.load.audio(AudioKey.ButtonClick, 'assets/sounds/button_click.wav');
    this.load.audio(AudioKey.ButtonHover, 'assets/sounds/button_hover.wav');
    this.load.audio(AudioKey.ChangeSelection, 'assets/sounds/change_selection.wav');
    this.load.audio(AudioKey.Touch, 'assets/sounds/touch.wav');
    this.load.audio(AudioKey.StartGame, 'assets/sounds/start_game.mp3');
    this.load.audio(AudioKey.PaddleHit, 'assets/sounds/paddle_hit.wav');
    this.load.audio(AudioKey.BallHit, 'assets/sounds/ball_hit.wav');
  }

  private loadFonts() {
    this.loadFont(FontKey.Text, 'assets/fonts/rexlia.otf');
    this.load.bitmapFont(FontKey.Retro, 'assets/fonts/retro.png', 'assets/fonts/retro.xml');
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
