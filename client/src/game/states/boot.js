var AudioPlayer = require("../util/audio_player");

var Boot = function () {};

module.exports = Boot;

Boot.prototype = {

  preload: function () {
    this.load.bitmapFont('retro_font', 'assets/fonts/retro_font.png', 'assets/fonts/retro_font.xml');
  },

  create: function () {
    game.stage.disableVisibilityChange = true; // So that game doesn't stop when window loses focus.
    game.input.maxPointers = 1;
    AudioPlayer.initialize();
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    if (game.device.desktop) {
      game.stage.scale.pageAlignHorizontally = true;
    } else {
      game.scale.minWidth =  480;
      game.scale.minHeight = 260;
      game.scale.maxWidth = 640;
      game.scale.maxHeight = 480;
      game.scale.forceLandscape = true;
      game.scale.pageAlignHorizontally = true;
      game.scale.updateLayout (true);
    }

    game.state.start('Preloader');
  }
};
