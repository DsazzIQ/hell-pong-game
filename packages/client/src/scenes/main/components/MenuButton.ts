import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { Math, Scene } from 'phaser';

import BitmapTextButton from '../../../components/BitmapTextButton';
import FontSize from '../../../constants/FontSize';
import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const BUTTON_SCALE = 2;
export default class MenuButton extends BitmapTextButton {
  constructor(scene: Scene, position: IPosition, text: string, onClick: () => void) {
    super(
      scene,
      position,
      TextureKey.Gui.Frames.Button.Main,
      { text, fontSize: FontSize.ExtraSmallText },
      BUTTON_SCALE,
      onClick
    );

    this.addAnimation(scene, {
      targets: this.container,
      x: (scene.game as Game).centerX,
      duration: 500,
      ease: Math.Easing.Linear
    });
  }
}
