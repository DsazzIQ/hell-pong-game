import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { GameObjects, Scene } from 'phaser';

import Button from '../../../components/Button';
import { ROW_OFFSET } from '../../../components/GUIContainer';
import Slider from '../../../components/Slider';
import TextureKey from '../../../constants/TextureKey';
import { Setting } from '../../../entities/settings/Setting';

export default class SliderRow {
  private readonly icon: GameObjects.Image;
  private readonly sliderContainer: GameObjects.Container;
  constructor(scene: Scene, iconFrame: string, setting: Setting<number>, offset: IPosition) {
    this.icon = scene.add
      .image(ROW_OFFSET.x + offset.x, ROW_OFFSET.y + offset.y, TextureKey.Gui.Key, iconFrame)
      .setOrigin(0.5);
    const iconButton = new Button(scene, { x: ROW_OFFSET.x + offset.x, y: ROW_OFFSET.y + offset.y }, iconFrame);
    const iconMatrix = this.icon.preFX.addColorMatrix();

    const slider = new Slider(
      scene,
      { x: 0, y: 0 },
      (value) => {
        iconMatrix.grayscale(1 - value); //change icon color
        setting.set(value);
      },
      setting.get()
    );
    slider.container.setPosition(this.icon.x + this.icon.width + slider.size.width, this.icon.y);
    this.sliderContainer = slider.container;
  }

  public getElements(): GameObjects.GameObject[] {
    return [this.icon, this.sliderContainer];
  }
}
