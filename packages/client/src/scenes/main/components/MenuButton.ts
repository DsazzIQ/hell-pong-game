import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { Math, Scene } from 'phaser';

import BitmapTextButton from '../../../components/Button/BitmapTextButton';
import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;
import BitmapSize from '../../../constants/BitmapSize';

const BUTTON_SCALE = 2;
export default class MenuButton extends BitmapTextButton {
  constructor(scene: Scene, position: IPosition, text: string, onClick: () => void) {
    super(
      scene,
      position,
      TextureKey.Gui.Frames.Button.Main,
      { text, fontSize: BitmapSize.ExtraSmall },
      BUTTON_SCALE,
      onClick
    );

    this.addAnimation(scene, {
      targets: this,
      x: (scene.game as Game).centerX,
      duration: 500,
      ease: Math.Easing.Linear
    } as TweenBuilderConfig);
  }
}
