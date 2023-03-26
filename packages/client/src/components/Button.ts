import Phaser from 'phaser';
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;

export default class Button {
  protected readonly sprite: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame: string,
    onClick: () => void
  ) {
    this.sprite = scene.add.sprite(x, y, 'textures', frame);

    this.sprite
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.onHoverState())
      .on('pointerout', () => this.onOutState())
      .on('pointerdown', () => this.onActive(onClick));
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

  /**
   * x – The horizontal offset of the shadow effect. Default 0.
   * y – The vertical offset of the shadow effect. Default 0.
   * decay – The amount of decay for shadow effect. Default 0.1.
   * power – The power of the shadow effect. Default 1.
   * color – The color of the shadow. Default 0x000000.
   * samples – The number of samples that the shadow effect will run for. An integer between 1 and 12. Default 6.
   * intensity – The intensity of the shadow effect. Default 1.
   */
  protected onHoverState() {
    this.sprite.preFX.addShadow(1, 1, 0.1, 1, 0xff0000);
  }

  protected onOutState() {
    this.sprite.preFX.clear();
  }

  protected onActive(onClick: () => void) {
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
