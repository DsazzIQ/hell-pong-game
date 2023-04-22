import { Scene } from 'phaser';
import Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import TextureKey from '../../constants/TextureKey';
import Depth from '../../constants/Depth';
import { GameConstant } from '@hell-pong/shared/constants/game';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';
import Color from '@hell-pong/shared/constants/color';
import IConfig = Dialog.IConfig;
import DialogButton from './DialogButton';
import logger from '../../logger';
import { ISize } from '@hell-pong/shared/entities/component/Size';

export default class YesNoDialog extends Dialog {
  constructor(scene: Scene, title: string, text: string, onYesClick: () => void) {
    const size: ISize = { width: 400, height: 200 };
    const config: IConfig = {
      x: GameConstant.WidthCenter,
      y: GameConstant.HeightCenter,
      width: size.width,
      height: size.height,
      background: scene.add.image(0, 0, TextureKey.Background.Key, TextureKey.Background.Frames.Dialog),

      align: {
        title: 'center',
        actions: 'center'
      },
      space: {
        title: 35,
        content: 25,
        action: 15,

        top: 25,
        right: 30,
        bottom: 20,
        left: 30
      },

      expand: {
        title: false,
        content: false
        // description: false,
        // choices: false,
        // actions: true,
      },

      click: {
        mode: 'pointerdown',
        clickInterval: 1000
      },

      title: scene.add.text(0, 0, title, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallTitle,
        wordWrap: { width: size.width - 30 * 2 }
      }),
      content: scene.add.text(0, 0, text, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText
      }),
      actions: [
        new DialogButton(scene, TextureKey.Gui.Frames.Button.Ok, onYesClick, Color.Green),
        new DialogButton(
          scene,
          TextureKey.Gui.Frames.Button.Cancel,
          () => {
            logger.info('Cancel action');
          },
          Color.Red
        )
      ]
    };

    super(scene, config);
    scene.add.existing(this);

    this.layout();
    this.setDepth(Depth.Dialog);

    this.modal({
      manualClose: false
    });
  }
}
