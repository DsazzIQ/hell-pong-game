import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { FX, GameObjects, Scene } from 'phaser';

import Button from '../../../components/Button/Button';
import { ROW_OFFSET } from '../../../components/GUIContainer';
import Slider from '../../../components/Slider';
import EventKey from '../../../constants/EventKey';
import { VolumeSetting } from '../../../entities/settings/VolumeSetting';
import Color from '@hell-pong/shared/constants/color';

export default class VolumeSliderRow extends GameObjects.Container {
  private iconButton!: Button;
  private slider!: Slider;
  private readonly onUpdateEvent: EventKey;
  private iconMatrix!: FX.ColorMatrix;

  constructor(scene: Scene, iconFrame: string, setting: VolumeSetting, offset: IPosition, onUpdateEvent: EventKey) {
    super(scene);

    this.onUpdateEvent = onUpdateEvent;

    this.initIconButton(scene, iconFrame, setting, offset);
    this.initSlider(scene, setting);

    scene.game.events.on(this.onUpdateEvent, this.handleVolumeChangedEvent, this);
    scene.events.on(Phaser.Input.Events.SHUTDOWN, this.destroy, this);
  }

  private initIconButton(scene: Scene, iconFrame: string, setting: VolumeSetting, offset: IPosition): void {
    const iconPosition = { x: ROW_OFFSET.x + offset.x, y: ROW_OFFSET.y + offset.y };
    this.iconButton = new Button(scene, iconPosition, iconFrame, () => setting.toggle(), Color.Orange);
    this.iconMatrix = this.iconButton.sprite.postFX.addColorMatrix();
    this.changeIconGreyScaleByValue(setting.get());
  }

  private initSlider(scene: Scene, setting: VolumeSetting): void {
    this.slider = new Slider(
      scene,
      { x: 0, y: 0 },
      (value) => {
        setting.set(value);
      },
      setting.get()
    );
    this.slider.setPosition(
      this.iconButton.x + this.iconButton.sprite.width + this.slider.size.width,
      this.iconButton.y
    );
  }

  private handleVolumeChangedEvent(value: number) {
    this.changeIconGreyScaleByValue(value);
    this.slider.changeThumbPosByValue(value);
  }

  private changeIconGreyScaleByValue(value: number) {
    this.iconMatrix.grayscale(1 - value);
  }

  public destroy(): void {
    if (this.onUpdateEvent) {
      this.scene.game.events.off(this.onUpdateEvent, this.handleVolumeChangedEvent, this);
    }
  }

  public getElements(): GameObjects.GameObject[] {
    return [this.iconButton, this.slider];
  }
}
