import BackButton from '../../components/BackButton';
import GUIContainer, { ROW_OFFSET } from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
// import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import AudioKey from '../../constants/AudioKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import Game from '../../Game';

export default class SettingsScene extends Phaser.Scene {
  private background: LavaBackground;

  constructor() {
    super(SceneKey.Settings);
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
    new TitleText(this, 'Settings');
    this.initGUI();
  }

  private initGUI() {
    const gui = new GUIContainer(this);
    gui.addToContainer(this.createVolumeRow());
  }

  private createVolumeRow(): Phaser.GameObjects.GameObject[] {
    const musicIcon = this.add
      .image(ROW_OFFSET.x, ROW_OFFSET.y, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Music)
      .setOrigin(0.5);
    const iconMatrix = musicIcon.preFX.addColorMatrix();

    const changeMusicColor = (value) => {
      iconMatrix.grayscale(1 - value);
    };
    const slider = new Slider(this, 0, 0, changeMusicColor, 0.5);
    slider.container.setPosition(musicIcon.x + musicIcon.width + slider.size.width, musicIcon.y);

    return [musicIcon, slider.container];
  }

  update() {
    this.background.move();
  }
}
