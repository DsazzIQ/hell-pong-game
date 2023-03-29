import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';
import Game from '../Game';

const GUI_MARGIN_X = 50;
const GUI_MARGIN_Y = 20;
const GUI_SCALE = 2.5;

type GUIFragment = {
  frame: string;
  position: { x: number; y: number };
  origin: { x: number; y: number };
  display?: { width: number; height: number };
  scale?: number;
};

export default class GUIContainer {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const { config } = scene.game as Game;
    const width = config.width as number;
    const height = config.height as number;

    const cornerFragments = this.createCornerFragments(scene, width, height);
    const crossFragments = this.createCrossFragments(scene, width, height, cornerFragments);
    const centerFragment = this.createCenterFragment(scene, crossFragments);

    this.container = scene.add.container(0, 0, [...cornerFragments, ...crossFragments, centerFragment]);
    this.container.setPosition(0, 0).setDepth(Depth.Gui);
  }

  private createCornerFragments(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Image[] {
    const topLeft = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.TopLeft,
      position: { x: GUI_MARGIN_X, y: GUI_MARGIN_Y },
      origin: { x: 0, y: 0 },
      scale: GUI_SCALE
    });

    const topRight = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.TopRight,
      position: { x: width - GUI_MARGIN_X, y: GUI_MARGIN_Y },
      origin: { x: 1, y: 0 },
      scale: GUI_SCALE
    });

    const bottomLeft = this.createFragment(scene, {
      position: { x: GUI_MARGIN_X, y: height - GUI_MARGIN_Y },
      frame: TextureKey.Gui.Frames.Backstage.BottomLeft,
      origin: { x: 0, y: 1 },
      scale: GUI_SCALE
    });

    const bottomRight = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.BottomRight,
      position: { x: width - GUI_MARGIN_X, y: height - GUI_MARGIN_Y },
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
      position: { x: topLeft.getTopRight().x, y: GUI_MARGIN_Y },
      origin: { x: 0, y: 0 },
      display: {
        width: width - topLeft.displayWidth - topRight.displayWidth - GUI_MARGIN_X * 2,
        height: topLeft.displayHeight
      }
    });

    const bottom = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Bottom,
      position: { x: bottomLeft.getTopRight().x, y: height - GUI_MARGIN_Y },
      origin: { x: 0, y: 1 },
      display: {
        width: width - bottomLeft.displayWidth - bottomRight.displayWidth - GUI_MARGIN_X * 2,
        height: bottomLeft.displayHeight
      }
    });

    const left = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Left,
      position: { x: GUI_MARGIN_X, y: topLeft.getBottomLeft().y },
      origin: { x: 0, y: 0 },
      display: {
        width: topLeft.displayWidth,
        height: height - topLeft.displayHeight - bottomLeft.displayHeight
      }
    });

    const right = this.createFragment(scene, {
      frame: TextureKey.Gui.Frames.Backstage.Right,
      position: {
        x: width - GUI_MARGIN_X,
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
