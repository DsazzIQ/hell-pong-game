import BackButton from '../../components/BackButton';
import GUIContainer from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import AudioKey from '../../constants/AudioKey';
import SceneKey from '../../constants/SceneKey';
import Game from '../../Game';

export default class OptionsScene extends Phaser.Scene {
  private background: LavaBackground;

  constructor() {
    super(SceneKey.Options);
  }

  public init(): void {
    this.sound.add(AudioKey.SecondaryTheme);
  }

  playTheme() {
    this.sound.get(AudioKey.SecondaryTheme).play({ loop: true, volume: 0.1 });
  }

  stopTheme() {
    this.sound.get(AudioKey.SecondaryTheme).stop();
  }

  public create(): void {
    // this.playTheme();
    this.background = new LavaBackground(this);

    new BackButton(this, () => {
      // this.stopTheme();
      (this.game as Game).startTransition(this, SceneKey.Main);
    });
    new TitleText(this, 'Options');
    this.initGUI();
  }

  private initGUI() {
    const { centerX, centerY } = this.game as Game;
    new GUIContainer(this);
    new Slider(this, centerX, centerY, (value) => console.log(value), 0.5);
  }

  update() {
    this.background.move();
  }
}
