import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { ISize } from '@hell-pong/shared/entities/component/Size';

import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';
import Game from '../Game';
import Slider from './Slider';

type GUIFragment = {
  frame: string;
  position: IPosition;
  origin: IPosition;
  display?: ISize;
  scale?: number;
};

const GUI_MARGIN: IPosition = { x: 50, y: 20 };
const GUI_SCALE = 2.5;

const ROW_OFFSET = { x: 160, y: 25 };
const INNER_BOX_TOP_LEFT: IPosition = { x: 60, y: 140 };

export default class GUIContainer {
  private guiContainer: Phaser.GameObjects.Container;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const { config } = scene.game as Game;
    const width = config.width as number;
    const height = config.height as number;

    const cornerFragments = this.createCornerFragments(scene, width, height);
    const crossFragments = this.createCrossFragments(scene, width, height, cornerFragments);
    const centerFragment = this.createCenterFragment(scene, crossFragments);

    this.guiContainer = scene.add.container(0, 0, [...cornerFragments, ...crossFragments, centerFragment]);
    this.guiContainer.setPosition(0, 0).setDepth(Depth.Gui);

    this.container = scene.add.container(INNER_BOX_TOP_LEFT.x, INNER_BOX_TOP_LEFT.y);

    const musicIcon = scene.add
      .image(ROW_OFFSET.x, ROW_OFFSET.y, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Music)
      .setOrigin(0.5);
    const iconMatrix = musicIcon.preFX.addColorMatrix();
    this.container.add(musicIcon);

    const slider = new Slider(
      scene,
      0,
      0,
      (value) => {
        iconMatrix.grayscale(1 - value);
      },
      0.5
    );
    slider.container.setPosition(musicIcon.x + musicIcon.width + slider.size.width, musicIcon.y);
    this.container.add(slider.container);
  }

  private createCornerFragments(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Image[] {
    const topLeft = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.TopLeft,
      position: { x: GUI_MARGIN.x, y: GUI_MARGIN.y },
      origin: { x: 0, y: 0 },
      scale: GUI_SCALE
    });

    const topRight = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.TopRight,
      position: { x: width - GUI_MARGIN.x, y: GUI_MARGIN.y },
      origin: { x: 1, y: 0 },
      scale: GUI_SCALE
    });

    const bottomLeft = this.createFragment(scene, {
      position: { x: GUI_MARGIN.x, y: height - GUI_MARGIN.y },
      frame: TextureKey.Gui.Frames.Backstage.BottomLeft,
      origin: { x: 0, y: 1 },
      scale: GUI_SCALE
    });

    const bottomRight = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.BottomRight,
      position: { x: width - GUI_MARGIN.x, y: height - GUI_MARGIN.y },
      origin: { x: 1, y: 1 },
      scale: GUI_SCALE
    });

    return [topLeft, topRight, bottomLeft, bottomRight];
  }

  private createCrossFragments(
    scene: Phaser.Scene,
    width: number,
    height: number,
    [topLeft, topRight, bottomLeft, bottomRight]: Phaser.GameObjects.Image[]
  ): Phaser.GameObjects.Image[] {
    const top = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Top,
      position: { x: topLeft.getTopRight().x, y: GUI_MARGIN.y },
      origin: { x: 0, y: 0 },
      display: {
        width: width - topLeft.displayWidth - topRight.displayWidth - GUI_MARGIN.x * 2,
        height: topLeft.displayHeight
      }
    });

    const bottom = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Bottom,
      position: { x: bottomLeft.getTopRight().x, y: height - GUI_MARGIN.y },
      origin: { x: 0, y: 1 },
      display: {
        width: width - bottomLeft.displayWidth - bottomRight.displayWidth - GUI_MARGIN.x * 2,
        height: bottomLeft.displayHeight
      }
    });

    const left = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Left,
      position: { x: GUI_MARGIN.x, y: topLeft.getBottomLeft().y },
      origin: { x: 0, y: 0 },
      display: {
        width: topLeft.displayWidth,
        height: height - topLeft.displayHeight - bottomLeft.displayHeight
      }
    });

    const right = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Right,
      position: {
        x: width - GUI_MARGIN.x,
        y: topRight.getBottomLeft().y
      },
      origin: { x: 1, y: 0 },
      display: {
        width: topRight.displayWidth,
        height: height - topRight.displayHeight - bottomRight.displayHeight
      }
    });

    return [top, bottom, left, right];
  }

  private createCenterFragment(
    scene: Phaser.Scene,
    [top, , left]: Phaser.GameObjects.Image[]
  ): Phaser.GameObjects.Image {
    return this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Center,
      position: { x: left.getTopRight().x, y: top.getBottomLeft().y },
      origin: { x: 0, y: 0 },
      display: { width: top.displayWidth, height: left.displayHeight }
    });
  }

  private createFragment(
    scene: Phaser.Scene,
    { position, frame, origin, display, scale }: GUIFragment
  ): Phaser.GameObjects.Image {
    const fragment = scene.add.image(position.x, position.y, TextureKey.Gui.Key, frame).setOrigin(origin.x, origin.y);
    if (display) {
      fragment.setDisplaySize(display.width, display.height);
    }
    if (scale) {
      fragment.setScale(scale);
    }
    return fragment;
  }
}
