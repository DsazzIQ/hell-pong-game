var DEFAULT_PLAYER_SPEED = 300;

var Player = function(x, y, id, name, leftKey, rightKey) {
    Phaser.Sprite.call(this, game, x, y, 'pong_textures', 'paddle/paddle');

    this.id = id;

    this.leftKey = game.input.keyboard.addKey(leftKey || Phaser.Keyboard.LEFT);
    this.rightKey = game.input.keyboard.addKey(rightKey || Phaser.Keyboard.RIGHT);
    this.score = 0;
    this.name = name || 'Player ' + id;
    this.speed = DEFAULT_PLAYER_SPEED;
    this.isFreezed = false;

    this.spawnPoint = {
        x: x,
        y: y
    };

    game.physics.arcade.enable(this);
    this.body.bounce.set(1);
    this.anchor.set(0.5);

    game.add.existing(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.scoreInc = function() {
    this.score += 1;
};

Player.prototype.reset = function() {
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.speed = DEFAULT_PLAYER_SPEED;
    this.isFreezed = false;

    if (!this.alive) {
        this.revive();
    }
};

Player.prototype.handleInput = function() {
    var moving = true;
    if (this.leftKey.isDown) {
        this.body.velocity.x = -this.speed;
    } else if (this.rightKey.isDown) {
        this.body.velocity.x = this.speed;
    } else {
        moving = false;
        this.freeze();
    }

    var currentTime = new Date().getTime();
    socket.emit("move player", {
        x: this.body.velocity.x,
        timeMovement: currentTime
    });
};

Player.prototype.freeze = function() {
    this.body.velocity.x = 0;
};

module.exports = Player;
