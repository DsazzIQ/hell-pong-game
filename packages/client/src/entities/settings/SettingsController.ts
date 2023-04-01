import Game from '../../Game';
import { VolumeSetting } from './VolumeSetting';

export class SettingsController {
  private readonly volumeSetting: VolumeSetting;

  constructor(game: Game) {
    this.volumeSetting = new VolumeSetting((volume: number) => (game.sound.volume = volume));
  }

  getVolumeSetting(): VolumeSetting {
    return this.volumeSetting;
  }
}
