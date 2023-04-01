import { Scene } from 'phaser';
import io, { Socket } from 'socket.io-client';

import FontFamily from '../../constants/FontFamily';
import MusicKey from '../../constants/MusicKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import SoundKey from '../../constants/SoundKey';
import TextureKey from '../../constants/TextureKey';
import { SettingsController } from '../../entities/settings/SettingsController';
import Game from '../../Game';
import RoundedProgressBar from './components/RoundedProgressBar';
const SOCKET_URL = 'http://localhost:3000';

export default class PreloaderScene extends Scene {
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
    this.registerAudios();

    this.registry.set(RegistryKey.Socket, socket);

    const settings = new SettingsController(this.game as Game);
    this.registry.set(RegistryKey.SettingsController, settings);
  }

  private loadTextures() {
    this.load.atlas(TextureKey.Background.Key, TextureKey.Background.TextureUrl, TextureKey.Background.AtlasUrl);
    this.load.atlas(TextureKey.Gui.Key, TextureKey.Gui.TextureUrl, TextureKey.Gui.AtlasUrl);
  }

  private loadAudios() {
    this.load.audio(MusicKey.MainTheme, 'assets/sounds/main_theme.mp3');
    this.load.audio(MusicKey.SecondaryTheme, 'assets/sounds/secondary_theme.mp3');
    this.load.audio(MusicKey.SplashLogo, 'assets/sounds/splash.mp3');

    this.load.audio(SoundKey.ButtonClick, 'assets/sounds/button_click.mp3');
    this.load.audio(SoundKey.ButtonHover, 'assets/sounds/button_hover.mp3');
    this.load.audio(SoundKey.ChangeSelection, 'assets/sounds/change_selection.mp3');
    this.load.audio(SoundKey.Touch, 'assets/sounds/touch.mp3');
    this.load.audio(SoundKey.StartGame, 'assets/sounds/start_game.mp3');
    this.load.audio(SoundKey.PaddleHit, 'assets/sounds/paddle_hit.mp3');
    this.load.audio(SoundKey.BallHit, 'assets/sounds/ball_hit.mp3');
  }

  private registerAudios() {
    this.sound.add(MusicKey.MainTheme);
    this.sound.add(MusicKey.SecondaryTheme);
    this.sound.add(MusicKey.SplashLogo);
    this.sound.add(SoundKey.ButtonClick);
    this.sound.add(SoundKey.ButtonHover);
    this.sound.add(SoundKey.ChangeSelection);
    this.sound.add(SoundKey.Touch);
    this.sound.add(SoundKey.StartGame);
    this.sound.add(SoundKey.PaddleHit);
    this.sound.add(SoundKey.BallHit);
  }

  private loadFonts() {
    this.loadFont(FontFamily.Text, 'assets/fonts/rexlia.otf');
    this.load.bitmapFont(FontFamily.Retro, 'assets/fonts/retro.png', 'assets/fonts/retro.xml');
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
