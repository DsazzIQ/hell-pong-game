var Preloader = function () {};

module.exports = Preloader;

Preloader.prototype = {

  displayLoader: function() {
    this.text = game.add.bitmapText(
      game.world.centerX, 
      game.world.centerY, 
      "retro_font",
      "Loading... ",
      30
    );
    this.text.anchor.setTo(.5, .5);

    this.load.onFileComplete.add(function(progress) {
        this.text.setText("Loading... " + progress + "%");
    }, this);

    this.load.onLoadComplete.add(function() {
        game.state.start("TitleScreen");
    });
  },

  preload: function () {
    this.displayLoader();

    this.load.atlasJSONHash("bbo_textures", "assets/textures/bbo_textures.png", "assets/textures/bbo_textures.json");
    this.load.atlasJSONHash("pong_textures", "assets/textures/pong_textures.png", "assets/textures/pong_textures.json");

    this.load.tilemap("levelOne", "assets/levels/level_one.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap("levelTwo", "assets/levels/level_two.json", null, Phaser.Tilemap.TILED_JSON);

    this.load.image("tiles", "assets/tiles/tileset.png");

    this.load.audio("click", "assets/sounds/click.ogg");
    this.load.audio("main_theme", "assets/sounds/main_theme.ogg");

    window.buttonClickSound = new Phaser.Sound(game, "click", .25);
  }
};
