import LineProgress from 'phaser3-rex-plugins/plugins/gameobjects/canvas/lineprogress/LineProgress';

import Game from '../../../Game';

const PROGRESS_BOX_WIDTH = 250;
const PROGRESS_BOX_HEIGHT = 25;

const COLOR_PRIMARY = 0xa42337;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

const BORDER_COLOR = 0xff0000;
const BORDER_WIDTH = 3;

export default class RoundedProgressBar extends LineProgress {
  constructor(scene) {
    const game = scene.game as Game;
    super(scene, {
      valuechangeCallback(newValue) {
        console.log(`[Progress] ${newValue}%`);
      },
      x: game.centerX,
      y: game.centerY,
      width: PROGRESS_BOX_WIDTH,
      height: PROGRESS_BOX_HEIGHT,
      barColor: COLOR_PRIMARY,
      trackColor: COLOR_DARK,
      trackStrokeColor: COLOR_LIGHT
    });

    scene.add.existing(this);

    const halfWidth = PROGRESS_BOX_WIDTH * 0.5;
    const halfHeight = PROGRESS_BOX_HEIGHT * 0.5;
    const maskX = game.centerX - halfWidth;
    const maskY = game.centerY - halfHeight;

    // Create rounded mask
    const mask = scene.add
      .graphics({
        lineStyle: {
          width: BORDER_WIDTH,
          color: BORDER_COLOR,
          alpha: 1
        }
      })
      .fillRoundedRect(maskX, maskY, PROGRESS_BOX_WIDTH, PROGRESS_BOX_HEIGHT, halfHeight)
      .strokeRoundedRect(maskX, maskY, PROGRESS_BOX_WIDTH, PROGRESS_BOX_HEIGHT, halfHeight);
    this.setMask(mask.createGeometryMask());
  }
}
