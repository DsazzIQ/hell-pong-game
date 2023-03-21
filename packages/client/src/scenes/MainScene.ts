import Phaser from 'phaser';
import {BaseScene} from "./BaseScene";

class MainScene extends BaseScene {

    private startButton!: Phaser.GameObjects.Sprite;
    private volumeButton!: Phaser.GameObjects.Sprite;
    private mainThemeSound!: Phaser.Sound.BaseSound;

    constructor() {
        super("Main");
    }

    create() {
        this.initSound();
        this.initBackground();
        this.initTitle();
        this.initStartButton();
        this.initVolumeButton();
    }

    initSound() {
        this.mainThemeSound = this.sound.add("main_theme");
    }

    playMainTheme() {
        this.mainThemeSound.play({ loop: true, volume: 0.05 });
        this.volumeButton.setFrame("button/volume-on");
    }

    stopMainTheme() {
        this.mainThemeSound.stop();
        this.volumeButton.setFrame("button/volume-off");
    }

    // Play the animation on the sprite
    // Set sprite height to screen height
    // background.displayHeight = this.game.canvas.height as number;
    // const scale = background.displayHeight / background.height;
    // background.displayWidth = background.width * scale;
    initBackground() {
        // Get a reference to the scene's animation manager
        const anims = this.anims;
        const background = this.add.sprite(this.centerX, this.centerY, "textures", "background/main/0000");
        // Create the animation and add it to the animation manager
        anims.create({
            key: "menu_bg_animation",
            frames: anims.generateFrameNames("textures", {
                prefix: "background/main/",
                zeroPad: 4,
                start: 0,
                end: 7,
            }),
            repeat: -1,
            frameRate: 6,
        });

        background.displayHeight = this.game.canvas.height as number;
        const scale = background.displayHeight / background.height;
        background.displayWidth = background.width * scale;

        background
          .setDepth(-1)
          .setOrigin(0.5)
          .play("menu_bg_animation");
    }

    initTitle() {
        console.log("Scale", this.scale);
        const title = this.add.image(
          this.centerX,
          0,
          "textures",
          "text/main-title"
        ).setOrigin(0.5);
        title.setScale(this.scaleFactor * 2);

        // Set the final position of the title
        this.tweens.add({
            targets: title,
            y: this.centerY * 0.35 * this.scaleFactor,
            duration: 1000,
            ease: Phaser.Math.Easing.Bounce.Out,
            delay: 200,
        });

    }

    initStartButton() {
        this.startButton = this.add.sprite(
          0,
          0,
          "textures",
          "button/main-start"
        );
        this.startButton
          .setY(this.centerY * this.scaleFactor)
          .setScale(this.scaleFactor);

        this.addClickAnimation(this.startButton, () => {
            this.stopMainTheme();
            this.startTransition("Lobby");
        }, this.scaleFactor-0.1);

        // Move the button to the center
        this.tweens.add({
            targets: this.startButton,
            x: this.centerX,
            duration: 500,
            ease: Phaser.Math.Easing.Linear,
            delay: 200,
        });
    }

    initVolumeButton() {
        this.volumeButton = this.add.sprite(
          0,
          0,
          "textures",
          "button/volume-off"
          // "button/volume-on"
        );
        this.volumeButton.setScale(this.scaleFactor);
        this.volumeButton.setX(this.game.canvas.width - this.volumeButton.width * this.scaleFactor);
        this.volumeButton.setY(this.volumeButton.height * this.scaleFactor);

        this.addClickAnimation(this.volumeButton, () => {
            if (this.mainThemeSound.isPlaying) {
                this.stopMainTheme();
            } else {
                this.playMainTheme();
            }
        }, this.scaleFactor-0.1);
    }

    update() {}
}

export default MainScene;