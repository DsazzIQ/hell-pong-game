import { FX, GameObjects, Scene } from 'phaser';

import BackButton from '../../components/BackButton';
import GUIContainer, { ROW_OFFSET } from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import MusicKey from '../../constants/MusicKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import { SettingsController } from '../../entities/settings/SettingsController';
import Game from '../../Game';

const OFFSET_SETTING_ROW = { x: 140 };
export default class SettingsScene extends Scene {
  private settingsController: SettingsController;

  private background: LavaBackground;

  constructor() {
    super(SceneKey.Settings);
  }

  public init(): void {
    this.settingsController = this.registry.get(RegistryKey.SettingsController);
  }

  playTheme() {
    this.sound.get(MusicKey.SecondaryTheme).play({ loop: true });
  }

  stopTheme() {
    this.sound.get(MusicKey.SecondaryTheme).stop();
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
    gui.addToContainer(this.createSoundVolumeRow());
    gui.addToContainer(this.createMusicVolumeRow());
  }

  private createSoundVolumeSlider(musicIcon: GameObjects.Image, iconMatrix: FX.ColorMatrix) {
    const slider = new Slider(
      this,
      { x: 0, y: 0 },
      (value) => {
        //change music icon color
        iconMatrix.grayscale(1 - value);
        this.settingsController.soundVolume.set(value);
      },
      this.settingsController.soundVolume.get()
    );
    slider.container.setPosition(musicIcon.x + musicIcon.width + slider.size.width, musicIcon.y);

    return slider.container;
  }

  private createSoundVolumeRow(): GameObjects.GameObject[] {
    const soundIcon = this.add
      .image(ROW_OFFSET.x + OFFSET_SETTING_ROW.x, ROW_OFFSET.y, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Sound)
      .setOrigin(0.5);
    const iconMatrix = soundIcon.preFX.addColorMatrix();

    return [soundIcon, this.createSoundVolumeSlider(soundIcon, iconMatrix)];
  }

  private createMusicVolumeSlider(musicIcon: GameObjects.Image, iconMatrix: FX.ColorMatrix) {
    const slider = new Slider(
      this,
      { x: 0, y: 0 },
      (value) => {
        //change music icon color
        iconMatrix.grayscale(1 - value);
        this.settingsController.musicVolume.set(value);
      },
      this.settingsController.musicVolume.get()
    );
    slider.container.setPosition(musicIcon.x + musicIcon.width + slider.size.width, musicIcon.y);

    return slider.container;
  }

  private createMusicVolumeRow(): GameObjects.GameObject[] {
    const musicIcon = this.add
      .image(
        ROW_OFFSET.x + OFFSET_SETTING_ROW.x,
        ROW_OFFSET.y + 60,
        TextureKey.Gui.Key,
        TextureKey.Gui.Frames.Icon.Music
      )
      .setOrigin(0.5);
    const iconMatrix = musicIcon.preFX.addColorMatrix();

    return [musicIcon, this.createMusicVolumeSlider(musicIcon, iconMatrix)];
  }

  update() {
    this.background.move();
  }
}
