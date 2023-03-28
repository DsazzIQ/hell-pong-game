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
    this.sound.get(AudioKey.MainTheme).play({ loop: true, volume: 0.1 });
  }

  stopTheme() {
    this.sound.get(AudioKey.MainTheme).stop();
  }

  initButtons() {
    const game = this.game as Game;
    new MenuButton(this, game.centerY, 'button/menu-start', () => {
      this.stopTheme();
      game.startTransition(this, SceneKey.Lobby);
    });

    new MenuButton(this, game.centerY * 1.25, 'button/menu-options', () => {
      this.stopTheme();
      game.startTransition(this, SceneKey.Options);
    });
  }
}

export default MainScene;
