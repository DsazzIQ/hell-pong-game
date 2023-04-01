import Phaser from 'phaser';

import AudioKey from '../../constants/AudioKey';
import SceneKey from '../../constants/SceneKey';
import Game from '../../Game';
import Background from './components/Background';
import MenuButton from './components/MenuButton';
import Title from './components/Title';

class MainScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Main);
  }

  init() {
    this.sound.add(AudioKey.MainTheme);
  }

  create() {
    new Background(this);
    new Title(this);

    this.initButtons();
    this.playTheme();
  }

  playTheme() {
    this.sound.get(AudioKey.MainTheme).play({ loop: true });
  }

  stopTheme() {
    this.sound.get(AudioKey.MainTheme).stop();
  }

  initButtons() {
    const { centerY, config, startTransition } = this.game as Game;
    new MenuButton(this, { x: 0, y: centerY }, 'start', () => {
      this.stopTheme();
      startTransition(this, SceneKey.Lobby);
    });

    new MenuButton(this, { x: config.width as number, y: centerY * 1.2 }, 'settings', () => {
      this.stopTheme();
      startTransition(this, SceneKey.Settings);
    });
  }
}

export default MainScene;
