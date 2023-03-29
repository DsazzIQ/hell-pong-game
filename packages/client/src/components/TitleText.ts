import FontKey from '../constants/FontKey';
import FontSize from '../constants/FontSize';
import Game from '../Game';

const TOP_OFFSET = 0.17;
export default class TitleText {
  constructor(scene: Phaser.Scene, text: string) {
    const container = scene.add.group();
    container.setOrigin(0.5);

    const title = scene.add.bitmapText(0, 0, FontKey.Retro, text, FontSize.Title).setOrigin(0.5);
    container.add(title);

    container.setXY((scene.game as Game).centerX, (scene.game as Game).centerY * TOP_OFFSET);
  }
}
