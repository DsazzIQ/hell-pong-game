var Fader = require("../util/fader");

function TitleScreen() {
};


TitleScreen.prototype = {
    create: function() {
        this.titleOffsetX = game.width/2 * 0.1;
        this.titleOffsetY = game.height/2 * 0.25;
        this.buttonOffsetX = game.width/2 * 0.1;
        this.startButtonOffsetY = 275;
        this.howToButtonOffsetY = 340;
        this.volumeButtonOffsetX = game.width/2 * 1.75;
        this.volumeButtonOffsetY = game.height/2 * 0.1;

        this.showingInstructions = false;
        this.justClickedHowTo = false;
        this.justClickedOutOfHowTo = false;

        var mainThemeSound = game.add.audio("main_theme", .25);
        mainThemeSound.play();

        var background = game.add.sprite(0, 0, "pong_textures", "menu/menu_1");
        background.animations.add("menu_bg_animation", [
                "menu/menu_1",
                "menu/menu_2",
                "menu/menu_3",
                "menu/menu_4",
                "menu/menu_5",
                "menu/menu_6",
                "menu/menu_7",
                "menu/menu_8"
            ], 6, true);

        background.animations.play("menu_bg_animation");

        var title = game.add.image(this.titleOffsetX, 0, "pong_textures", "menu/menu_title");
        var titleTween = game.add.tween(title);
        titleTween.to({y: this.titleOffsetY}, 1000, Phaser.Easing.Bounce.Out, true, 200).start();

        this.createButtons();

        var startButtonTween = this.createInitialButtonTween(this.startButton, 200);
        var howToButtonTween = this.createInitialButtonTween(this.howToButton, 400);
        startButtonTween.start();
        howToButtonTween.start();
    },

    createInitialButtonTween: function(button, delay) {
        return game.add.tween(button).to({x: this.buttonOffsetX}, 500, Phaser.Easing.Default, false, delay);
    },

    createButtons: function() {
         this.volumeButton = game.add.button(this.volumeButtonOffsetX, this.volumeButtonOffsetY, "pong_textures", function() {
            // Global mute!  Use this.sound.mute to mute a single sound
            if (this.game.sound.mute) {
                this.game.sound.mute = false;
                this.volumeButton.setFrames("button/volume_on");
            } else {
                this.game.sound.mute = true;
                this.volumeButton.setFrames("button/volume_off");
            }
        }, this, "button/volume_on", "button/volume_on");
        
        this.startButton = game.add.button(this.buttonOffsetX - 250, this.startButtonOffsetY, "pong_textures", function() {
            if(!this.showingInstructions && !this.justClickedOutOfHowTo) {
                Fader.fadeOut(function() {
                    game.state.start("Lobby");
                });
            }
        }, this, "button/lava_button_2", "button/lava_button_1");
        this.startButton.setDownSound(buttonClickSound);
        
        var startText = this.game.add.bitmapText(
            this.startButton.width/2, 
            this.startButton.height/2, 
            "retro_font",
            "START GAME", 
            20  
        );
        startText.anchor.set(0.5);
        this.startButton.addChild(startText);

        this.howToButton = game.add.button(this.buttonOffsetX - 250, this.howToButtonOffsetY, "pong_textures", function() {
            if(!this.showingInstructions && !this.justClickedOutOfHowTo) {
                this.showingInstructions = true;
                Fader.fadeOut(function() {
                    this.howTo = game.add.image(0, 0, TEXTURES, "titlescreen/howtoplay.png");
                    this.justClickedHowTo = true;
                    Fader.fadeIn();
                }, this);
            }
        }, this, "button/lava_button_2", "button/lava_button_1");
        
        var howToText = this.game.add.bitmapText(
            this.howToButton.width/2, 
            this.howToButton.height/2, 
            "retro_font",
            "HOW TO PLAY", 
            20  
        );
        howToText.anchor.set(0.5);
        this.howToButton.addChild(howToText);
        this.howToButton.setDownSound(buttonClickSound);
    },

    update: function() {
        if(!game.input.activePointer.isDown && this.justClickedHowTo) {
            this.justClickedHowTo = false;
        }

        if(!game.input.activePointer.isDown && this.justClickedOutOfHowTo) {
            this.justClickedOutOfHowTo = false;
        }

        if(game.input.activePointer.isDown && this.showingInstructions && !this.justClickedHowTo) {
            buttonClickSound.play();
            this.showingInstructions = false;
            this.justClickedOutOfHowTo = true;
            Fader.fadeOut(function() {
                this.howTo.destroy();
                Fader.fadeIn();
            }, this);
        }
    }
}

module.exports = TitleScreen;
