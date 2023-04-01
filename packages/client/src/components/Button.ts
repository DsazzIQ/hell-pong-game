import { FX, GameObjects, Input, Scene, Sound, Types } from 'phaser';
import TweenBuilderConfig = Types.Tweens.TweenBuilderConfig;
import { IPosition } from '@hell-pong/shared/entities/component/Position';

import SoundKey from '../constants/SoundKey';
import TextureKey from '../constants/TextureKey';

export default class Button extends GameObjects.GameObject {
  public readonly container: GameObjects.Container;

  protected readonly sprite: GameObjects.Sprite;
  protected onHoverColor: number;
  private shadow: FX.Shadow;

  private clickSound: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
  private hoverSound: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;

  constructor(scene: Scene, position: IPosition, frame: string, onClick: () => void, onHoverColor = 0xff0000) {
    super(scene, 'Button');

    this.container = scene.add.container(position.x, position.y);
    this.onHoverColor = onHoverColor;

    this.sprite = scene.add.sprite(0, 0, TextureKey.Gui.Key, frame);
    this.sprite.setOrigin(0.5);

    this.container.add(this.sprite);

    this.shadow = this.sprite.preFX.addShadow(0.5, 0, 0.15, 1, this.onHoverColor);
    this.stopShadow();

    this.clickSound = scene.sound.add(SoundKey.ButtonClick);
    this.hoverSound = scene.sound.add(SoundKey.ButtonHover);

    this.sprite
      .setInteractive({ useHandCursor: true })
      .on(Input.Events.POINTER_OVER, () => this.onHoverState())
      .on(Input.Events.POINTER_OUT, () => this.onOutState())
      .on(Input.Events.POINTER_DOWN, () => this.onClick(onClick));
  }

  public setOrigin(x?, y?) {
    this.sprite.setOrigin(x, y);
    return this;
  }

  protected startShadow() {
    this.shadow.active = true;
  }

  protected stopShadow() {
    this.shadow.active = false;
  }

  set x(x: number) {
    this.sprite.x = x;
  }
  get x(): number {
    return this.sprite.x;
  }

  set y(y: number) {
    this.sprite.y = y;
  }
  get y(): number {
    return this.sprite.y;
  }

  get width(): number {
    return this.sprite.width;
  }

  get height(): number {
    return this.sprite.height;
  }

  protected onHoverState() {
    this.hoverSound.play();
    this.startShadow();
  }

  protected onOutState() {
    this.stopShadow();
  }

  protected onClick(onClick: () => void) {
    this.clickSound.play();

    const scaleFactor = this.container.scale - 0.1;
    this.sprite.scene.tweens.add({
      targets: this.container,
      scale: scaleFactor,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: onClick
    } as TweenBuilderConfig);
  }

  protected addAnimation(scene: Scene, config: TweenBuilderConfig) {
    scene.tweens.add(config);
  }
}
