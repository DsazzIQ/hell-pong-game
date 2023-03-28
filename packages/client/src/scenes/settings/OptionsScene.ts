import BackButton from '../../components/BackButton';
import LavaBackground from '../../components/LavaBackground';
import Slider from '../../components/Slider';
import TitleText from '../../components/TitleText';
import AudioKey from '../../constants/AudioKey';
import Depth from '../../constants/Depth';
import SceneKey from '../../constants/SceneKey';
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
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    // Add margins
    const marginX = 50;
    const marginY = 20;
    const scale = 2.5;

    const topLeft = this.add.image(marginX, marginY, 'gui', 'top-left').setOrigin(0, 0).setScale(scale);
    const top = this.add
      .image(topLeft.width + marginX, marginY, 'gui', 'top')
      .setDisplaySize(width - topLeft.width * 2 - marginX * 2, topLeft.displayHeight)
      .setOrigin(0, 0);
    const topRight = this.add
      .image(width - marginX, marginY, 'gui', 'top-right')
      .setOrigin(1, 0)
      .setScale(scale);

    const bottomLeft = this.add
      .image(marginX, height - marginY, 'gui', 'bottom-left')
      .setOrigin(0, 1)
      .setScale(scale);
    const bottom = this.add
      .image(bottomLeft.width + marginX, height - marginY, 'gui', 'bottom')
      .setDisplaySize(width - bottomLeft.width * 2 - marginX * 2, bottomLeft.displayHeight)
      .setOrigin(0, 1);
    const bottomRight = this.add
      .image(width - marginX, height - marginY, 'gui', 'bottom-right')
      .setOrigin(1, 1)
      .setScale(scale);

    const left = this.add
      .image(marginX, topLeft.displayHeight, 'gui', 'left')
      .setDisplaySize(topLeft.displayWidth, height - topLeft.displayHeight - bottomLeft.displayHeight)
      .setOrigin(0, 0);
    const center = this.add
      .image(topLeft.displayWidth + marginX, top.displayHeight, 'gui', 'center')
      .setDisplaySize(width - topLeft.displayWidth * 2 - marginX * 2, height - top.displayHeight - marginY)
      .setOrigin(0, 0);
    const right = this.add
      .image(width - marginX, topRight.displayHeight - marginY, 'gui', 'right')
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

    const game = this.game as Game;

    // You can adjust the container's position and scaling here, if needed
    uiContainer.setPosition(0, 0).setDepth(Depth.Gui);
    // this.addSlider(this, 50, 100, 'slider', 0, 100, 50);
    new Slider(this, game.centerX, game.centerY, (value) => console.log(value), 0.5);
  }

  update() {
    this.background.move();
  }
}
