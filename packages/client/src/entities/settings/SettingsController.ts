import { Sound } from 'phaser';

import { isMusicKey } from '../../constants/MusicKey';
import { isSoundKey } from '../../constants/SoundKey';
import Game from '../../Game';
import { SettingType } from './Setting';
import { VolumeSetting } from './VolumeSetting';

export class SettingsController {
  public readonly soundVolume: VolumeSetting;
  public readonly musicVolume: VolumeSetting;

  constructor(game: Game) {
    this.soundVolume = new VolumeSetting(SettingType.SoundVolume, (volume: number) =>
      game.sound.getAll('').map((sound: Sound.BaseSound) => {
        const current = sound as Sound.WebAudioSound;
        if (current && isSoundKey(sound.key)) {
          current.setVolume(volume);
        }
      })
    );

    this.musicVolume = new VolumeSetting(SettingType.MusicVolume, (volume: number) =>
      game.sound.getAll('').map((sound: Sound.BaseSound) => {
        const current = sound as Sound.WebAudioSound;
        if (isMusicKey(sound.key)) {
          current.setVolume(volume);
        }
      })
    );
  }
}
