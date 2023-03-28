// import Depth from '../constants/Depth';
import FontKey from '../constants/FontKey';
import FontSize from '../constants/FontSize';
import Game from '../Game';

// const BACKDROP_RADIUS = 16;
// const BACKDROP_OFFSET = 8;
// const BACKDROP_ORIGIN = 0.75;
// const BACKDROP_COLOR = 0x000000;

export default class TitleText {
  constructor(scene: Phaser.Scene, text: string) {
    // Create a container group to hold the text and the background shape
    const container = scene.add.group();
    container.setOrigin(0.5);

    const title = scene.add.bitmapText(0, 0, FontKey.Retro, text, FontSize.Title).setOrigin(0.5);
    container.add(title);

    // const backdrop = scene.add
    //   .graphics()
    //   .fillStyle(BACKDROP_COLOR, 0.5)
    //   .fillRoundedRect(
    //     -title.width * 0.5 - BACKDROP_OFFSET,
    //     -title.height * 0.5 - BACKDROP_OFFSET,
    //     title.width + BACKDROP_OFFSET * 2,
    //     title.height * BACKDROP_ORIGIN + BACKDROP_OFFSET * 2,
    //     BACKDROP_RADIUS
    //   )
    //   .setDepth(Depth.Shadow);
    // container.add(backdrop);

    container.setXY((scene.game as Game).centerX, (scene.game as Game).centerY * 0.17);
  }
}
