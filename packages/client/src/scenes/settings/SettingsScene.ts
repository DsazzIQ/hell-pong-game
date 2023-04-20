import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { Scene } from 'phaser';

import BackButton from '../../components/Button/BackButton';
import GUIContainer from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import TitleText from '../../components/TitleText';
import EventKey from '../../constants/EventKey';
import MusicKey from '../../constants/MusicKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import { SettingsController } from '../../entities/settings/SettingsController';
import Game from '../../Game';
import VolumeSliderRow from './components/VolumeSliderRow';

const OFFSET_ROW: IPosition = { x: 140, y: 60 };
export default class SettingsScene extends Scene {
  private settingsController!: SettingsController;

  private background!: LavaBackground;
  private soundRow!: VolumeSliderRow;
  private musicRow!: VolumeSliderRow;

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
    const { startTransition } = this.game as Game;

    this.playTheme();
    this.background = new LavaBackground(this);

    new BackButton(this, () => {
      this.stopTheme();
      startTransition(this, SceneKey.Main);
    });
    new TitleText(this, 'settings');
    this.initGUI();
  }

  private initGUI() {
    const gui = new GUIContainer(this);
    this.addMusicRow(gui);
    this.addSoundRow(gui);
  }

  private addMusicRow(gui: GUIContainer) {
    this.musicRow = new VolumeSliderRow(
      this,
      TextureKey.Gui.Frames.Icon.Music,
      this.settingsController.musicVolume,
      {
        x: OFFSET_ROW.x,
        y: 0
      },
      EventKey.MusicVolumeChanged
    );
    gui.addToContainer(this.musicRow.getElements());
  }

  private addSoundRow(gui: GUIContainer) {
    this.soundRow = new VolumeSliderRow(
      this,
      TextureKey.Gui.Frames.Icon.Sound,
      this.settingsController.soundVolume,
      OFFSET_ROW,
      EventKey.SoundVolumeChanged
    );
    gui.addToContainer(this.soundRow.getElements());
  }

  update() {
    this.background?.move();
  }
}
