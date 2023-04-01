import AudioKey from '../../constants/AudioKey';
import SceneKey from '../../constants/SceneKey';
import Game from '../../Game';
import Logo from './components/Logo';

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Splash);
  }

  create() {
    this.sound.play(AudioKey.SplashLogo);
    new Logo(this, () => {
      (this.game as Game).startTransition(this, SceneKey.Main);
      this.sound.get(AudioKey.SplashLogo).stop();
    });
  }
}
