var TextConfigurer = require('../util/text_configurer');

var PendingGame = function() {}

module.exports = PendingGame;

var xOffset = 20;
var yOffset = 25;

var buttonXOffset = 330;
var startGameButtonYOffset = 250;
var leaveButtonYOffset = 300;

var characterSquareXDistance = 105;

var characterOffsetX = 4.5;
var characterOffsetY = 4.5;

var minPlayerMessageOffsetY = 200;

var repeatingLavaTilesprite;

PendingGame.prototype = {
    init: function(tilemapName, gameId, rbts) {
        this.tilemapName = tilemapName;
        this.gameId = gameId;
        repeatingLavaTilesprite = rbts;
    },

    create: function() {
        socket.emit("enter pending game", {gameId: this.gameId});

        this.backdrop = game.add.image(xOffset, yOffset, "pong_textures", "lobby/lobby_backdrop");

        var backdropCenterX = this.backdrop.width/2;
        this.startGameButton = game.add.button(backdropCenterX, startGameButtonYOffset, TEXTURES, null, this,
            "lobby/buttons/start_game_button_03.png", "lobby/buttons/start_game_button_03.png");
        this.startGameButton.anchor.set(0.5);

        this.leaveGameButton = game.add.button(backdropCenterX, leaveButtonYOffset, TEXTURES, this.leaveGameAction, null, 
            "lobby/buttons/leave_game_button_02.png", "lobby/buttons/leave_game_button_01.png");
        this.leaveGameButton.anchor.set(0.5);

        this.leaveGameButton.setDownSound(buttonClickSound);

        this.characterSquares = this.drawCharacterSquares();
        this.characterImages = [];
        this.numPlayersInGame = 0;

        this.minPlayerMessage = game.add.text(backdropCenterX, minPlayerMessageOffsetY, "Cannot start game\nwithout 2 players.")
        TextConfigurer.configureText(this.minPlayerMessage, "red", 17);
        this.minPlayerMessage.anchor.set(0.5);
        this.minPlayerMessage.visible = false;

        this.backdrop.addChild(this.startGameButton);
        this.backdrop.addChild(this.leaveGameButton);
        this.backdrop.addChild(this.minPlayerMessage);

        socket.on("show current players", this.populateCharacterSquares.bind(this));
        socket.on("player joined", this.playerJoined.bind(this));
        socket.on("player left", this.playerLeft.bind(this));
        socket.on("start game on client", this.startGame);
    },

    update: function() {
        repeatingLavaTilesprite.tilePosition.x++;
        repeatingLavaTilesprite.tilePosition.y--;
    },

    drawCharacterSquares: function() {
        var squareWidth = 89;
        var xOffset = this.backdrop.width/2 - squareWidth;
        var yOffset = this.backdrop.height * 0.15;
        var squareFrame = "lobby/slots/character_square_01.png";

        var firstSquare = game.add.sprite(xOffset, yOffset, TEXTURES, squareFrame);
        var secondSquare = game.add.sprite(xOffset + characterSquareXDistance, yOffset, TEXTURES, squareFrame);

        this.backdrop.addChild(firstSquare);
        this.backdrop.addChild(secondSquare);

        var characterSquares = [];
        characterSquares[0] = firstSquare;
        characterSquares[1] = secondSquare;

        return characterSquares;
    },

    populateCharacterSquares: function(data) {
        this.numPlayersInGame = 0;

        for(var playerId in data.players) {
            var color = data.players[playerId].color;
            this.characterImages[playerId] = game.add.image(
                this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX,
                this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY,
                TEXTURES,
                "lobby/bomberman_head/bomberman_head_" + color + ".png"
            );
            this.backdrop.addChild(this.characterImages[playerId]);

            this.numPlayersInGame++;
        }

        if(this.numPlayersInGame > 1) {
            this.activateStartGameButton();
        } else {
            this.minPlayerMessage.visible = true;
        }
    },

    playerJoined: function(data) {
        this.numPlayersInGame++;
        var index = this.numPlayersInGame - 1;

        this.characterImages[data.id] = game.add.image(
            this.characterSquares[index].position.x + characterOffsetX,
            this.characterSquares[index].position.y + characterOffsetY,
            TEXTURES,
            "lobby/bomberman_head/bomberman_head_" +  data.color + ".png"
        );
        this.backdrop.addChild(this.characterImages[data.id]);

        // Activate start game button if this is the second player to join the game.
        if(this.numPlayersInGame == 2) {
            this.activateStartGameButton();
        }
    },

    activateStartGameButton: function() {
        this.minPlayerMessage.visible = false;
        this.startGameButton.setFrames("lobby/buttons/start_game_button_02.png", "lobby/buttons/start_game_button_01.png");
        this.startGameButton.onInputUp.removeAll();
        this.startGameButton.onInputUp.add(this.startGameAction, this);
        this.startGameButton.setDownSound(buttonClickSound);
    },

    deactivateStartGameButton: function() {
        this.minPlayerMessage.visible = true;
        this.startGameButton.setFrames("lobby/buttons/start_game_button_03.png", "lobby/buttons/start_game_button_03.png");
        this.startGameButton.onInputUp.removeAll();
        this.startGameButton.setDownSound(null);
    },

    playerLeft: function(data) {
        this.numPlayersInGame--;

        if(this.numPlayersInGame == 1) {
            this.deactivateStartGameButton();
        }

        for(var playerId in this.characterImages) {
            this.characterImages[playerId].destroy();
        }
        this.populateCharacterSquares(data);
    },

    // When the "start" button is clicked, send a message to the server to initialize the game.
    startGameAction: function() {
        socket.emit("start game on server");
    },

    leaveGameAction: function() {
        socket.emit("leave pending game");
        socket.removeAllListeners();
        game.state.start("Lobby", true, false, repeatingLavaTilesprite);
    },

    startGame: function(data) {
        repeatingLavaTilesprite.doNotDestroy = false;
        socket.removeAllListeners();
        game.state.start("Level", true, false, data.mapName, data.players, this.id);
    }
}
