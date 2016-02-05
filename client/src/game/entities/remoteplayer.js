var remotePlayerUpdateInterval = 100;

var RemotePlayer = function(x, y, id, name) {
    this.id = id;
    this.lastMoveTime = 0;
    this.velocityX = 0;
    this.spawnPoint = {x: x, y: y};
    this.name = name || 'Player ' + id;
    this.score = 0;

    Phaser.Sprite.call(this, game, x, y, 'pong_textures', 'paddle/paddle');

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.bounce.set(1);

    this.anchor.set(0.5);

    game.add.existing(this);
};

RemotePlayer.prototype = Object.create(Phaser.Sprite.prototype);

RemotePlayer.prototype.interpolate = function() {
    this.body.velocity.x = this.velocityX;

    var currentTime = new Date().getTime();
    this.lastMoveTime = currentTime;
};

//RemotePlayer.prototype.isMovementTimeExpired = function() {
    //var currentTime = new Date().getTime();
    //return this.lastMoveTime+10 <= currentTime;
//}

RemotePlayer.prototype.reset = function() {
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.velocityX = 0;
    this.lastMoveTime = 0;
    this.score = 0;

    if(!this.alive) {
        this.revive();
    }
};

module.exports = RemotePlayer;
