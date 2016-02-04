var BLACK_HEX_CODE = "#000000";
var TILE_SIZE = 40;

var AudioPlayer = require("../util/audio_player");
var Player = require("../entities/player");
var RemotePlayer = require("../entities/remoteplayer");
var Ball = require("../entities/ball");
var RoundEndAnimation = require("../entities/round_end_animation");

var Level = function () {};

module.exports = Level;

Level.prototype = {

  init: function(tilemapName, players, id) {
    this.tilemapName = tilemapName;
    this.players = players;
    this.playerId = '/#' + id;
    this.remotePlayers = {},
    this.gameFrozen = true,
    this.isGameOver = false
  },

  setEventHandlers: function() {
    // Remember - these will actually be executed from the context of the Socket, not from the context of the level.
    socket.on("disconnect", this.onSocketDisconnect);
    socket.on("m", this.onMovePlayer.bind(this));
    socket.on("new round", this.onNewRound.bind(this));
    socket.on("end game", this.onEndGame.bind(this));
    socket.on("no opponents left", this.onNoOpponentsLeft.bind(this));
  },

  create: function () {
    level = this;

    this.lastFrameTime;
    this.initializeStage();
    //this.launchPlayerScoreTable();

    this.ball = this.game.add.existing(
      new Ball(
        game.camera.width/2,
        game.camera.height/2
      )
    );
    this.ball.events.onOutOfBounds.add(this.ballLost, this);

    //this.launchIntroText();

    this.setEventHandlers();
    this.initializePlayers();

    //this.beginRoundAnimation("round_text/round_1.png");
    //
    //Event on click board start game
    //game.input.onDown.add(this.onNewRound, this);
    this.onNewRound();

  },

  initializeStage: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //var background = game.add.sprite(0, 0, 'pong_textures', 'lobby/lobby_bg');

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;
  },


  restartGame: function() {
    player.reset();
    for(var i in this.remotePlayers) {
      this.remotePlayers[i].reset();
    }

    this.lastFrameTime;
    this.gameFrozen = false;

    socket.emit("ready for round");
  },

  onNewRound: function(data) {
    //this.gameFrozen = true;
    //if (this.checkIsNewGame() || this.isGameOver) {
    console.log('Game started');
        if (this.isGameOver) {
            this.playerGroup.setAll('score', 0);
            //this.playerScoreTableGroup.setAll('text', '0');
            this.isGameOver = false;
        }

        this.gameFrozen = false;

        this.ball.body.velocity.y = -this.ball.speed;
        this.ball.body.velocity.x = 0;
        this.ball.animations.play('spin');

        //this.introText.visible = false;

        //this.playerScoreTableGroup.setAll('visible', true);
    //}
  },

  checkIsNewGame: function() {
    return false === this.gameFrozen && false === this.isGameOver;
  },

  onEndGame: function(data) {
    //this.gameFrozen = true;
    var animation = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
    animation.beginAnimation(function() {
      game.state.start("GameOver", true, false, data.gameWinnerColor, false);
    });
  },

  onNoOpponentsLeft: function(data) {
    game.state.start("GameOver", true, false, null, true);
  },

  update: function() {
    game.physics.arcade.collide(
      this.ball, this.playerGroup, this.ballHitPaddle, null, this
    );

    if(player != null && player.alive === true) {
      if(this.gameFrozen) {
        player.freeze();
      } else {
        player.handleInput();
      }
    }

    //TODO change array to one entity
    for(var id in this.remotePlayers) {
      this.remotePlayers[id].interpolate();
    }

  },

  onSocketDisconnect: function() {
    console.log("Disconnected from socket server.");

    this.broadcast.emit("remove player", {id: this.id});
  },

  initializePlayers: function() {
    this.playerGroup = this.game.add.physicsGroup();

    for(var i in this.players) {
      var data = this.players[i];
      if(data.id == this.playerId) {
        player = new Player(
          data.x, data.y, data.id, data.name
        );
        this.playerGroup.add(player);

      } else {
        this.remotePlayers[data.id] = new RemotePlayer(
          data.x, data.y, data.id, data.name
        );

        this.playerGroup.add(this.remotePlayers[data.id]);
      }
    }

    this.playerGroup.setAll('body.immovable', true);
    this.playerGroup.setAll('body.collideWorldBounds', true);
  },

  onMovePlayer: function(data) {
    if(player && data.id == player.id || this.gameFrozen) {
      return;
    }

    var movingPlayer = this.remotePlayers[data.id];
    if(movingPlayer.targetPositionX) {
      movingPlayer.lastMoveTime = game.time.now;

      if(data.x == movingPlayer.targetPositionX) {
        return;
      }

      movingPlayer.position.x = movingPlayer.targetPositionX;
    }

    movingPlayer.targetPositionX = data.x;
  },

  ballHitPaddle: function(ball, player) {
    var diff = 0;
    if (ball.x < player.x) {
        diff = player.x - ball.x;
        //  Ball is on the left-hand side of the paddle
        ball.body.velocity.x = (-10 * diff);
    } else if (ball.x > player.x) {
        //  Ball is on the right-hand side of the paddle
        diff = ball.x - player.x;
        ball.body.velocity.x = (10 * diff);
    } else {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        ball.body.velocity.x = 2 + Math.random() * 10;
    }
  },

  ballLost: function() {

    if (this.ball.y > this.game.height) {
        //this.playerTwo.scoreInc();
        //this.playerTwoScoreTable.text = this.playerTwo.score;
        this.ball.resetState();
        this.ball.startDirection('DOWN');
    }

    if (this.ball.y < 0) {
        //this.playerOne.scoreInc();
        //this.playerOneScoreTable.text = this.playerOne.score;
        this.ball.resetState();
        this.ball.startDirection('UP');
    }

    //if (this.playerOne.score > 1) {
    //    this.gameOver(this.playerOne.name);
    //}
    //if (this.playerTwo.score > 1) {
    //    this.gameOver(this.playerTwo.name);
    //}
  }
};
