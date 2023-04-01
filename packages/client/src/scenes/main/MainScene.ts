import { Scene } from 'phaser';

import MusicKey from '../../constants/MusicKey';
import SceneKey from '../../constants/SceneKey';
import Game from '../../Game';
import Background from './components/Background';
import MenuButton from './components/MenuButton';
import Title from './components/Title';

class MainScene extends Scene {
  constructor() {
    super(SceneKey.Main);
  }

  create() {
    new Background(this);
    new Title(this);

    this.initButtons();
    this.playTheme();
  }

  playTheme() {
    this.sound.get(MusicKey.MainTheme).play({ loop: true });
  }

  stopTheme() {
    this.sound.get(MusicKey.MainTheme).stop();
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
