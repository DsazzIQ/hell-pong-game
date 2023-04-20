import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { FX, GameObjects, Input, Scene, Types } from 'phaser';

import SoundKey from '../../constants/SoundKey';
import TextureKey from '../../constants/TextureKey';
import Color from '@hell-pong/shared/constants/color';

export default class Button extends GameObjects.Container {
  public readonly sprite: GameObjects.Sprite;
  protected onHoverColor: Color;
  private readonly shadow?: FX.Shadow;
  private readonly clickInterval: number;

  constructor(
    scene: Scene,
    position: IPosition,
    frame: string,
    onClick: () => void,
    onHoverColor = Color.Red,
    clickInterval = 1000
  ) {
    super(scene, position.x, position.y);

    this.onHoverColor = onHoverColor;
    this.clickInterval = clickInterval;

    this.sprite = scene.add.sprite(0, 0, TextureKey.Gui.Key, frame);
    this.sprite.setOrigin(0.5);
    this.add(this.sprite);

    this.shadow = this.sprite.preFX?.addShadow(0.5, 0, 0.15, 1, this.onHoverColor);
    this.stopShadow();

    this.sprite
      .setInteractive({ useHandCursor: true })
      .on(Input.Events.POINTER_OVER, () => this.onHoverState())
      .on(Input.Events.POINTER_OUT, () => this.onOutState())
      .on(Input.Events.POINTER_DOWN, () => this.onClick(onClick));

    scene.add.existing(this);
  }

  protected playOnClick() {
    this.scene.sound.get(SoundKey.ButtonClick).play();
  }

  protected playOnHover() {
    this.scene.sound.get(SoundKey.ButtonHover).play();
  }

  public setOrigin(x?, y?) {
    this.sprite.setOrigin(x, y);
    return this;
  }

  protected startShadow() {
    if (this.shadow) {
      this.shadow.active = true;
    }
  }

  protected stopShadow() {
    if (this.shadow) {
      this.shadow.active = false;
    }
  }

  protected onHoverState() {
    this.playOnHover();
    this.startShadow();
  }

  protected onOutState() {
    this.stopShadow();
  }

  protected preventMultiClick() {
    this.active = false;
    setTimeout(() => {
      this.active = true;
    }, this.clickInterval);
  }

  protected onClick(onClick: () => void) {
    if (!this.active) return; // Prevent multiple clicks
    this.preventMultiClick();

    this.playOnClick();

    const scaleFactor = this.scale - 0.1;
    this.sprite.scene.tweens.add({
      targets: this,
      scale: scaleFactor,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: onClick
    } as Types.Tweens.TweenBuilderConfig);
  }

  protected addAnimation(scene: Scene, config: Types.Tweens.TweenBuilderConfig) {
    scene.tweens.add(config);
  }
}
