var Player = function(xSpawn, ySpawn, id, name) {
    this.xSpawn = xSpawn;
    this.ySpawn = ySpawn;
    this.x = xSpawn;
    this.y = ySpawn;
    this.id = id;
    this.name = name || 'Player ' + id;
    this.wins = 0;
    this.score = 0;
    this.timeMovement = 0;

    this.alive = true;
};

Player.prototype = {
    resetForNewRound: function() {
        this.x = this.xSpawn;
        this.y = this.ySpawn;
        this.alive = true;
    }
}

module.exports = Player;
