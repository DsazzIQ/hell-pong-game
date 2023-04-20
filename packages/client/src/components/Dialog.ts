import { Scene } from 'phaser';
import Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import TextureKey from '../constants/TextureKey';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import SoundKey from '../constants/SoundKey';
import Depth from '../constants/Depth';
import { GameConstant } from '@hell-pong/shared/constants/game';
import FontFamily from '../constants/FontFamily';
import FontSize from '../constants/FontSize';
import Color from '@hell-pong/shared/constants/color';
import IConfig = Dialog.IConfig;

class MyLabel extends Label {
  private readonly _background: Phaser.GameObjects.Image;
  private readonly _shadow: Phaser.FX.Shadow | undefined;

  // constructor(scene: Scene, config) {
  constructor(scene: Scene, frame: string, highlight: Color) {
    const config: Label.IConfig = {
      align: 'center',
      width: 36,
      height: 36
    };

    super(scene, config);
    this.setInteractive({ useHandCursor: true });

    this._background = scene.add.image(0, 0, TextureKey.Gui.Key, frame);
    this.addBackground(this._background);
    this._shadow = this._background.preFX?.addShadow(0.5, 0.5, 0.25, 1, highlight);
    this.stopShadow();

    scene.add.existing(this);
  }

  protected startShadow() {
    if (this._shadow) {
      this._shadow.active = true;
    }
  }

  protected stopShadow() {
    if (this._shadow) {
      this._shadow.active = false;
    }
  }

  protected playOnClick() {
    this.scene.sound.get(SoundKey.ButtonClick).play();
  }

  protected playOnHover() {
    this.scene.sound.get(SoundKey.ButtonHover).play();
  }

  public onHoverState() {
    this.playOnHover();
    this.startShadow();
  }

  public onOutState() {
    this.stopShadow();
  }
}

export default class MyDialog extends Dialog {
  // constructor(scene: Scene, config: IConfig) {
  constructor(scene: Scene) {
    const config: IConfig = {
      x: GameConstant.WidthCenter,
      y: GameConstant.HeightCenter,
      width: 400,
      height: 200,
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
        right: 20,
        bottom: 20,
        left: 20
      },

      expand: {
        title: false,
        content: false
        // description: false,
        // choices: false,
        // actions: true,
      },

      title: scene.add.text(0, 0, 'Confirmation', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallTitle
      }),
      content: scene.add.text(0, 0, 'Do you want to quit?', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText
      }),
      actions: [
        // new OkButton(scene, () => console.log('Yes button clicked')),
        // new CancelButton(scene, () => console.log('Cancel button clicked'))
        new MyLabel(scene, TextureKey.Gui.Frames.Button.Ok, Color.Green).on('pointerdown', () => {
          console.log('Yes button clicked');
        }),
        new MyLabel(scene, TextureKey.Gui.Frames.Button.Cancel, Color.Red)
        // new MyLabel(scene, TextureKey.Gui.Frames.Button.EnterRoom),
        // new MyLabel(scene, TextureKey.Gui.Frames.Button.ExitRoom)
      ]
    };

    super(scene, config);
    scene.add.existing(this);

    this.layout();
    this.setDepth(Depth.Dialog);

    this.on(
      'action.over',
      function (button: MyLabel) {
        button.onHoverState();
      },
      this
    );
    this.on(
      'action.out',
      function (button: MyLabel) {
        button.onOutState();
      },
      this
    );
    this.modal({
      manualClose: false
    });
  }
}
