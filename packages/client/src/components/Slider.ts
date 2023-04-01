import { ISize, Size } from '@hell-pong/shared/entities/component/Size';

import AudioKey from '../constants/AudioKey';
import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';

const SLIDER_SCALE = 2;
export default class Slider extends Phaser.GameObjects.GameObject {
  private readonly trackContainer: Phaser.GameObjects.Container;
  private readonly _container: Phaser.GameObjects.Container;

  private value: number;

  private trackLeft: Phaser.GameObjects.Image;
  private trackCenter: Phaser.GameObjects.Image;
  private trackRight: Phaser.GameObjects.Image;
  private trackSize: Size;

  private thumb: Phaser.GameObjects.Image;

  private readonly onValueChanged: (value: number) => void;
  private arrowLeft: Phaser.GameObjects.Image;
  private arrowRight: Phaser.GameObjects.Image;

  private touchSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  constructor(scene: Phaser.Scene, x, y, onValueChanged: (value: number) => void, startValue = 0) {
    super(scene, 'Slider');

    this.onValueChanged = onValueChanged;

    this.touchSound = scene.sound.add(AudioKey.Touch);

    this.trackContainer = scene.add.container(0, 0);
    this._container = scene.add.container(x, y).setDepth(Depth.Base).setScale(SLIDER_SCALE);
    this._container.add(this.trackContainer);

    this.initializeTrack(scene);
    this.initializeThumb(scene);

    this.initLeftArrow(scene);
    this.initRightArrow(scene);
    this.registerArrowsEventHandlers();

    this.setInteractiveArea();
    this.registerThumbEventHandlers(scene);

    this.setValue(startValue);

    scene.input.enableDebug(this._container, 0xff00ff);
  }

  public get size(): ISize {
    return { width: this.trackSize.width + this.arrowLeft.width * 2, height: this.arrowLeft.height };
  }

  public get container() {
    return this._container;
  }

  private initializeTrack(scene: Phaser.Scene) {
    this.trackLeft = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackLeft);
    this.trackLeft.setOrigin(0, 0.5);
    this.trackContainer.add(this.trackLeft);

    this.trackCenter = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackCenter);
    this.trackCenter.setOrigin(0, 0.5);
    this.trackContainer.add(this.trackCenter);

    this.trackRight = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Slider.TrackRight);
    this.trackRight.setOrigin(0, 0.5);
    this.trackContainer.add(this.trackRight);

    this.initTrackSize();
    this.initTrackPosition();
  }

  private initLeftArrow(scene: Phaser.Scene) {
    this.arrowLeft = scene.add.image(
      this.trackContainer.x - this.trackSize.widthCenter,
      this.trackContainer.y,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Slider.ArrowLeftOut
    );
    this.arrowLeft.setInteractive({ useHandCursor: true }).setOrigin(1, 0.5);
    this._container.add(this.arrowLeft);
  }

  private initRightArrow(scene: Phaser.Scene) {
    this.arrowRight = scene.add.image(
      this.trackContainer.x + this.trackSize.widthCenter,
      this.trackContainer.y,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Slider.ArrowRightOut
    );
    this.arrowRight.setInteractive({ useHandCursor: true }).setOrigin(0, 0.5);
    this._container.add(this.arrowRight);
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

    this.trackContainer.add(this.thumb);
  }

  private calculateTrackWidth(): number {
    return this.trackLeft.width + this.trackCenter.width + this.trackRight.width;
  }

  private setInteractiveArea() {
    this.trackContainer.setInteractive({
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
      this.playTouch();
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
      this.playTouch();
      this.setThumbOutFrame();
    });

    this.trackContainer.on(Phaser.Input.Events.DRAG, ({ worldX }) => {
      this.setThumbInFrame();
      this.updateThumbPosition(this.worldToLocalX(worldX));
    });

    this.trackContainer.on(Phaser.Input.Events.POINTER_DOWN, ({ worldX }) => {
      this.playTouch();
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
    const { x } = this.trackContainer.getWorldTransformMatrix().applyInverse(worldX, 0);
    return x;
  }

  private playTouch() {
    this.touchSound.play();
  }
}
