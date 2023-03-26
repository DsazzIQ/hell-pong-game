import Phaser from 'phaser';

import AudioKey from '../../constants/AudioKey';
import SceneKey from '../../constants/SceneKey';
import HellPongGame from '../../Game';
import Background from './components/Background';
import MenuButton from './components/MenuButton';
import Title from './components/Title';

class MainScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Main);
  }

  create() {
    new Background(this);
    new Title(this);

    this.initButtons();
    this.playMainTheme();
  }

  playMainTheme() {
    this.sound.play(AudioKey.MainTheme, { loop: true, volume: 0.1 });
  }

  stopMainTheme() {
    this.sound.get(AudioKey.MainTheme).stop();
  }

  initButtons() {
    const game = this.game as HellPongGame;
    new MenuButton(this, game.centerY, 'button/menu-start', () => {
      this.stopMainTheme();
      game.startTransition(this, SceneKey.Lobby);
    });

    new MenuButton(this, game.centerY * 1.25, 'button/menu-options', () => {
      this.stopMainTheme();
      game.startTransition(this, SceneKey.Lobby);
    });
  }
}

export default MainScene;
