import Phaser from 'phaser';
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;
import AudioKey from '../constants/AudioKey';
import TextureKey from '../constants/TextureKey';

export default class Button extends Phaser.GameObjects.GameObject {
  protected readonly sprite: Phaser.GameObjects.Sprite;
  protected onHoverColor: number;
  private shadow: Phaser.FX.Shadow;

  private clickSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  private hoverSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: string, onClick: () => void, onHoverColor = 0xff0000) {
    super(scene, 'Button');

    this.onHoverColor = onHoverColor;

    this.sprite = scene.add.sprite(x, y, TextureKey.Gui.Key, frame);
    this.sprite.setOrigin(0.5);

    this.shadow = this.sprite.preFX.addShadow(0.5, 0, 0.15, 1, this.onHoverColor);
    this.stopShadow();

    this.clickSound = scene.sound.add(AudioKey.ButtonClick);
    this.hoverSound = scene.sound.add(AudioKey.ButtonHover);

    this.sprite
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => this.onHoverState())
      .on(Phaser.Input.Events.POINTER_OUT, () => this.onOutState())
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.onClick(onClick));
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

    const scaleFactor = this.sprite.scale - 0.1;
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      scale: scaleFactor,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: onClick
    } as TweenBuilderConfig);
  }

  protected addAnimation(scene: Phaser.Scene, config: TweenBuilderConfig) {
    scene.tweens.add(config);
  }
}
