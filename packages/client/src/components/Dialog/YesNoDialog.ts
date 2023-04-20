import { Input, Scene } from 'phaser';
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

class DialogButton extends Label {
  private readonly _background: Phaser.GameObjects.Image;
  private readonly _shadow: Phaser.FX.Shadow | undefined;

  // constructor(scene: Scene, config) {
  constructor(scene: Scene, frame: string, onClick: () => void, highlight: Color) {
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

    this.on(Input.Events.POINTER_DOWN, () => this._onClick(onClick));
    this.on(Input.Events.POINTER_OVER, () => this.onHoverState());
    this.on(Input.Events.POINTER_OUT, () => this.onOutState());

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

  protected _onClick(onClick: () => void) {
    this.playOnClick();
    onClick();
  }
}

export default class YesNoDialog extends Dialog {
  constructor(scene: Scene, title: string, text: string, onYesClick: () => void) {
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
        fontSize: FontSize.SmallTitle
      }),
      content: scene.add.text(0, 0, text, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText
      }),
      actions: [
        new DialogButton(scene, TextureKey.Gui.Frames.Button.Ok, onYesClick, Color.Green),
        new DialogButton(scene, TextureKey.Gui.Frames.Button.Cancel, () => {}, Color.Red)
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
