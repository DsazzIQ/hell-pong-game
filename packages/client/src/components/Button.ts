import Phaser from 'phaser';
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;
import AudioKey from '../constants/AudioKey';

export default class Button {
  protected readonly sprite: Phaser.GameObjects.Sprite;
  protected onHoverColor: number;
  private shadow: Phaser.FX.Shadow;
  private shine: Phaser.FX.Shine;
  private activeSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: string, onClick: () => void, onHoverColor = 0xff0000) {
    this.onHoverColor = onHoverColor;

    this.sprite = scene.add.sprite(x, y, 'textures', frame);
    this.sprite.setOrigin(0.5);

    this.shine = this.sprite.preFX.addShine(1, 1);
    this.stopShine();

    this.shadow = this.sprite.preFX.addShadow(1, 0, 0.1, 1, this.onHoverColor);
    this.stopShadow();

    this.activeSound = scene.sound.add(AudioKey.ButtonClick);

    this.sprite
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => this.onHoverState())
      .on(Phaser.Input.Events.POINTER_OUT, () => this.onOutState())
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.onActive(onClick));
  }

  protected startShine() {
    this.shine.active = true;
  }

  protected stopShine() {
    this.shine.active = false;
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
    this.startShadow();
    this.startShine();
  }

  protected onOutState() {
    this.stopShadow();
    this.stopShine();
  }

  protected onActive(onClick: () => void) {
    this.activeSound.play({ volume: 0.2 });

    const scaleFactor = 0.9;
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      scaleX: scaleFactor,
      scaleY: scaleFactor,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: onClick
    });
  }

  protected addAnimation(scene: Phaser.Scene, config: TweenBuilderConfig) {
    scene.tweens.add(config);
  }
}
