import { GameObjects, Scene } from 'phaser';

import FontSize from '../constants/FontSize';
import Game from '../Game';
import BitmapFamily from '../constants/BitmapFamily';

const TOP_OFFSET = 0.17;
export default class TitleText extends GameObjects.BitmapText {
  constructor(scene: Scene, text: string) {
    const { centerX, centerY } = scene.game as Game;
    super(scene, centerX, centerY * TOP_OFFSET, BitmapFamily.Retro, text, FontSize.Title);
    this.setOrigin(0.5);
    this.scene.add.existing(this);
  }
}
