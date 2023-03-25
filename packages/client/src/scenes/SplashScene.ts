import SplashLogo from '../components/SplashLogo';
import AudioKey from '../constants/AudioKey';
import HellPongGame from '../Game';

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash');
  }

  create() {
    const { width, height } = this.scale;
    this.sound.play(AudioKey.SplashLogo, { volume: 0.5 });

    new SplashLogo(this, width * 0.5, height * 0.5, () => {
      (this.game as HellPongGame).startTransition(this, 'Main');
      this.sound.get(AudioKey.SplashLogo).stop();
    });
  }
}
