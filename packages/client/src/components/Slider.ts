import { Size } from '@hell-pong/shared/entities/component/Size';

import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';

export default class Slider {
  private container: Phaser.GameObjects.Container;
  private value: number;

  private trackLeft: Phaser.GameObjects.Image;
  private trackCenter: Phaser.GameObjects.Image;
  private trackRight: Phaser.GameObjects.Image;
  private trackSize: Size;

  private thumb: Phaser.GameObjects.Image;

  private readonly onValueChanged: (value: number) => void;
  private arrowLeft: Phaser.GameObjects.Image;
  private arrowRight: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x, y, onValueChanged: (value: number) => void, startValue = 0) {
    this.onValueChanged = onValueChanged;

    this.container = scene.add.container(x, y).setDepth(Depth.Base).setScale(2);

    this.initializeTrack(scene);
    this.initializeThumb(scene);

    this.initArrows(scene);
    this.registerArrowsEventHandlers();

    this.setInteractiveArea();
    this.registerThumbEventHandlers(scene);

    this.setValue(startValue);
  }

  private initializeTrack(scene: Phaser.Scene) {
    this.trackLeft = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackLeft);
    this.trackLeft.setOrigin(0, 0.5);
    this.container.add(this.trackLeft);

    this.trackCenter = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackCenter);
    this.trackCenter.setOrigin(0, 0.5);
    this.container.add(this.trackCenter);

    this.trackRight = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackRight);
    this.trackRight.setOrigin(0, 0.5);
    this.container.add(this.trackRight);

    this.initTrackSize();
    this.initTrackPosition();
  }

  private initArrows(scene: Phaser.Scene) {
    this.arrowLeft = scene.add.image(
      this.container.x - this.trackSize.width,
      this.container.y,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Slider.ArrowLeftOut
    );
    this.arrowLeft.setInteractive({ useHandCursor: true }).setOrigin(1, 0.5).setScale(2);

    this.arrowRight = scene.add.image(
      this.container.x + this.trackSize.width,
      this.container.y,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Slider.ArrowRightOut
    );
    this.arrowRight.setInteractive({ useHandCursor: true }).setOrigin(0, 0.5).setScale(2);
  }

  private initTrackSize() {
    this.trackSize = new Size(this.calculateTrackWidth(), this.trackLeft.height);
  }

  private initTrackPosition() {
    this.trackLeft.x = -this.trackSize.widthCenter;
    this.trackCenter.x = this.trackLeft.x + this.trackLeft.width;
    this.trackRight.x = this.trackCenter.x + this.trackCenter.width;
  }

  private initializeThumb(scene: Phaser.Scene) {
    this.thumb = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.ThumbOut);
    this.thumb.setOrigin(0.5, 0.5);

    this.container.add(this.thumb);
  }

  private calculateTrackWidth(): number {
    return this.trackLeft.width + this.trackCenter.width + this.trackRight.width;
  }

  private setInteractiveArea() {
    this.container.setInteractive({
      draggable: true,
      hitArea: new Phaser.Geom.Rectangle(
        -this.trackSize.widthCenter,
        -this.trackSize.heightCenter,
        this.trackSize.width,
        this.trackSize.height
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
  }

  private setThumbOutFrame() {
    this.thumb.setTexture(TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.ThumbOut);
  }

  private setThumbInFrame() {
    this.thumb.setTexture(TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.ThumbIn);
  }

  private registerArrowEventHandlers(
    arrow: Phaser.GameObjects.Image,
    frameIn: string,
    frameOut: string,
    onClick: () => void
  ) {
    arrow.on(Phaser.Input.Events.POINTER_DOWN, () => {
      arrow.setTexture(TextureKey.Gui.Key, frameIn);
      onClick();
    });

    arrow.on(Phaser.Input.Events.POINTER_UP, () => {
      arrow.setTexture(TextureKey.Gui.Key, frameOut);
    });

    arrow.on(Phaser.Input.Events.POINTER_OVER, () => {
      arrow.setTexture(TextureKey.Gui.Key, frameIn);
    });

    arrow.on(Phaser.Input.Events.POINTER_OUT, () => {
      arrow.setTexture(TextureKey.Gui.Key, frameOut);
    });
  }

  private registerArrowsEventHandlers() {
    this.registerArrowEventHandlers(
      this.arrowLeft,
      TextureKey.Gui.Frames.Slider.ArrowLeftIn,
      TextureKey.Gui.Frames.Slider.ArrowLeftOut,
      () => this.updateThumbPosition(this.thumb.x - 1)
    );

    this.registerArrowEventHandlers(
      this.arrowRight,
      TextureKey.Gui.Frames.Slider.ArrowRightIn,
      TextureKey.Gui.Frames.Slider.ArrowRightOut,
      () => this.updateThumbPosition(this.thumb.x + 1)
    );
  }

  private registerThumbEventHandlers(scene: Phaser.Scene) {
    scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.setThumbOutFrame();
    });

    this.container.on(Phaser.Input.Events.DRAG, ({ worldX }) => {
      this.setThumbInFrame();
      this.updateThumbPosition(this.worldToLocalX(worldX));
    });

    this.container.on(Phaser.Input.Events.POINTER_DOWN, ({ worldX }) => {
      this.setThumbInFrame();
      this.updateThumbPosition(this.worldToLocalX(worldX));
    });
  }

  private get leftDraggableBorder(): number {
    return this.trackLeft.getLeftCenter().x + this.thumb.width * 0.5;
  }

  private get rightDraggableBorder(): number {
    return this.trackRight.getRightCenter().x - this.thumb.width * 0.5;
  }

  private updateThumbPosition(x: number) {
    const clampedX = Phaser.Math.Clamp(x, this.leftDraggableBorder, this.rightDraggableBorder);
    this.thumb.x = clampedX;

    this.value = Phaser.Math.Percent(clampedX - this.leftDraggableBorder, 0, this.trackSize.width - this.thumb.width);
    this.onValueChanged(this.value);
  }

  private setValue(value) {
    this.value = Phaser.Math.Clamp(value, 0, 1);
    this.thumb.x = Phaser.Math.Linear(this.leftDraggableBorder, this.rightDraggableBorder, this.value);
    this.onValueChanged(this.value);
  }

  private worldToLocalX(worldX: number): number {
    const { x } = this.container.getWorldTransformMatrix().applyInverse(worldX, 0);
    return x;
  }
}
