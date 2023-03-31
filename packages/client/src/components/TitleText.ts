import FontKey from '../constants/FontKey';
import FontSize from '../constants/FontSize';
import Game from '../Game';

const TOP_OFFSET = 0.17;
export default class TitleText extends Phaser.GameObjects.GameObject {
  constructor(scene: Phaser.Scene, text: string) {
    super(scene, 'TitleText');

    const container = scene.add.group();
    container.setOrigin(0.5);

    const title = scene.add.bitmapText(0, 0, FontKey.Retro, text, FontSize.Title).setOrigin(0.5);
    container.add(title);

    const { centerX, centerY } = scene.game as Game;
    container.setXY(centerX, centerY * TOP_OFFSET);
  }
}
