import { Scene } from 'phaser';

import MusicKey from '../../constants/MusicKey';
import SceneKey from '../../constants/SceneKey';
import Game from '../../Game';
import Logo from './components/Logo';

export default class SplashScene extends Scene {
  constructor() {
    super(SceneKey.Splash);
  }

  create() {
    this.sound.play(MusicKey.SplashLogo);
    new Logo(this, () => {
      (this.game as Game).startTransition(this, SceneKey.Main);
      this.sound.get(MusicKey.SplashLogo).stop();
    });
  }
}
