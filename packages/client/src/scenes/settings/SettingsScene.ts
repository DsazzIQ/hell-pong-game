import BackButton from '../../components/BackButton';
import GUIContainer, { ROW_OFFSET } from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import AudioKey from '../../constants/AudioKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import { SettingsController } from '../../entities/settings/SettingsController';
import Game from '../../Game';

const OFFSET_SETTING_ROW = { x: 140 };
export default class SettingsScene extends Phaser.Scene {
  private settingsController: SettingsController;

  private background: LavaBackground;

  constructor() {
    super(SceneKey.Settings);
  }

  public init(): void {
    this.settingsController = this.registry.get(RegistryKey.SettingsController);

    this.sound.add(AudioKey.SecondaryTheme);
  }

  playTheme() {
    this.sound.get(AudioKey.SecondaryTheme).play({ loop: true });
  }

  stopTheme() {
    this.sound.get(AudioKey.SecondaryTheme).stop();
  }

  public create(): void {
    this.playTheme();
    this.background = new LavaBackground(this);

    new BackButton(this, () => {
      this.stopTheme();
      (this.game as Game).startTransition(this, SceneKey.Main);
    });
    new TitleText(this, 'settings');
    this.initGUI();
  }

  private initGUI() {
    const gui = new GUIContainer(this);
    gui.addToContainer(this.createVolumeRow());
  }

  private createVolumeSlider(musicIcon: Phaser.GameObjects.Image, iconMatrix: Phaser.FX.ColorMatrix) {
    const slider = new Slider(
      this,
      0,
      0,
      (value) => {
        //change music icon color
        iconMatrix.grayscale(1 - value);
        this.settingsController.getVolumeSetting().set(value);
      },
      this.settingsController.getVolumeSetting().get()
    );
    slider.container.setPosition(musicIcon.x + musicIcon.width + slider.size.width, musicIcon.y);

    return slider;
  }

  private createVolumeRow(): Phaser.GameObjects.GameObject[] {
    const musicIcon = this.add
      .image(ROW_OFFSET.x + OFFSET_SETTING_ROW.x, ROW_OFFSET.y, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Music)
      .setOrigin(0.5);
    const iconMatrix = musicIcon.preFX.addColorMatrix();

    return [musicIcon, this.createVolumeSlider(musicIcon, iconMatrix)];
  }

  update() {
    this.background.move();
  }
}
