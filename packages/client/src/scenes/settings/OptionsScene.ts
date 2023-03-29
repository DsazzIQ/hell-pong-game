import BackButton from '../../components/BackButton';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import AudioKey from '../../constants/AudioKey';
import Depth from '../../constants/Depth';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import Game from '../../Game';

export default class OptionsScene extends Phaser.Scene {
  private background: LavaBackground;

  constructor() {
    super(SceneKey.Options);
  }

  public init(): void {
    this.sound.add(AudioKey.SecondaryTheme);
  }

  playTheme() {
    this.sound.get(AudioKey.SecondaryTheme).play({ loop: true, volume: 0.1 });
  }

  stopTheme() {
    this.sound.get(AudioKey.SecondaryTheme).stop();
  }

  public create(): void {
    this.playTheme();
    this.background = new LavaBackground(this);

    new BackButton(this, () => {
      this.stopTheme();
      (this.game as Game).startTransition(this, SceneKey.Main);
    });
    new TitleText(this, 'Options');
    this.initGUI();
  }

  private initGUI() {
    const { centerX, centerY, config } = this.game as Game;
    const { width, height } = config;

    // Add margins
    const marginX = 50;
    const marginY = 20;
    const scale = 2.5;

    const topLeft = this.add
      .image(marginX, marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.TopLeft)
      .setOrigin(0, 0)
      .setScale(scale);
    const top = this.add
      .image(topLeft.width + marginX, marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.Top)
      .setDisplaySize(width - topLeft.width * 2 - marginX * 2, topLeft.displayHeight)
      .setOrigin(0, 0);
    const topRight = this.add
      .image(width - marginX, marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.TopRight)
      .setOrigin(1, 0)
      .setScale(scale);

    const bottomLeft = this.add
      .image(marginX, height - marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.BottomLeft)
      .setOrigin(0, 1)
      .setScale(scale);
    const bottom = this.add
      .image(bottomLeft.width + marginX, height - marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.Bottom)
      .setDisplaySize(width - bottomLeft.width * 2 - marginX * 2, bottomLeft.displayHeight)
      .setOrigin(0, 1);
    const bottomRight = this.add
      .image(width - marginX, height - marginY, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.BottomRight)
      .setOrigin(1, 1)
      .setScale(scale);

    const left = this.add
      .image(marginX, topLeft.displayHeight, TextureKey.Gui.Key, TextureKey.Gui.Frames.Backstage.Left)
      .setDisplaySize(topLeft.displayWidth, height - topLeft.displayHeight - bottomLeft.displayHeight)
      .setOrigin(0, 0);
    const center = this.add
      .image(
        topLeft.displayWidth + marginX,
        top.displayHeight,
        TextureKey.Gui.Key,
        TextureKey.Gui.Frames.Backstage.Center
      )
      .setDisplaySize(width - topLeft.displayWidth * 2 - marginX * 2, height - top.displayHeight - marginY)
      .setOrigin(0, 0);
    const right = this.add
      .image(
        width - marginX,
        topRight.displayHeight - marginY,
        TextureKey.Gui.Key,
        TextureKey.Gui.Frames.Backstage.Right
      )
      .setDisplaySize(topRight.displayWidth, height - topRight.displayHeight - bottomRight.displayHeight)
      .setOrigin(1, 0);

    // Create container and add UI parts
    const uiContainer = this.add.container(0, 0, [
      topLeft,
      top,
      topRight,
      left,
      center,
      right,
      bottomLeft,
      bottom,
      bottomRight
    ]);
    uiContainer.setPosition(0, 0).setDepth(Depth.Gui);

    new Slider(this, centerX, centerY, (value) => console.log(value), 0.5);
  }

  update() {
    this.background.move();
  }
}
