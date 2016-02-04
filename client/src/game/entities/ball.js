var AudioPlayer = require("../util/audio_player");

var DEFAULT_BALL_SPEED = 640 * 0.25;

var Ball = function(x, y) {
    Phaser.Sprite.call(
        this, game, x, y, 'pong_textures', 'ball/ball_01'
    );

    game.physics.arcade.enable(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);

    this.animations.add(
        'spin', ['ball/ball_01', 'ball/ball_02', 'ball/ball_03'], 50, true, false
    );

    this.x = x;
    this.y = y;
    this.spawnPoint = {x: x, y: y};

    this.anchor.set(0.5);

    this.speed = DEFAULT_BALL_SPEED;
    this.isOnPaddle = false;
};

Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.resetState = function() {
    this.body.velocity.y = 0;
    this.body.velocity.x = 0;
    this.speed = DEFAULT_BALL_SPEED;
    this.animations.play('spin');
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
};

Ball.prototype.startDirection = function(direction) {
    switch (direction) {
        case 'UP':
            this.body.velocity.y = -this.speed;
            break;
        case 'DOWN':
            this.body.velocity.y = this.speed;
            break;
    }
};

module.exports = Ball;
