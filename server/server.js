global.__base = __dirname + '/';

var errorhandler = require('errorhandler');
var express = require("express");
var expressLayouts = require('express-ejs-layouts');
var app = express();
var config = require('./config');
var server = require("http").Server(app);
io = require("socket.io")(server);

TILE_SIZE = 40;
GAME_WIDTH = 480;
GAME_HEIGHT = 640;

// Game objects
var Player = require("./entities/player");
var Game = require("./entities/game");
var Lobby = require("./lobby");
var PendingGame = require("./entities/pending_game");

var games = {};

// Broadcasting loop works better than sending an update every time a player moves because waiting for player movement messages adds
// another source of jitter.
var updateInterval = 100; // Broadcast updates every 100 ms.

// Serve up index.html.
app.use(express.static(__base + '../client'));
app.set('env', config.get('env'));

app.set('view engine', 'ejs'); // register file extension for partials
app.set('views', __base + '../client');
app.set("layout extractScripts", true);
app.use(expressLayouts);

server.listen(config.get('port'), function() {
    console.log("Express server listening on port %d in %s mode", config.get('port'), app.get('env'));
});

init();

function init() {
    Lobby.initialize();

    // Begin listening for events.
    setEventHandlers();

    // Start game loop
    setInterval(broadcastingLoop, updateInterval);
};

function setEventHandlers () {
    io.on("connection", function(client) {
        console.log("New player has connected: " + client.id);

        client.on("move player", onMovePlayer);
        client.on("disconnect", onClientDisconnect);
        client.on("start game on server", onStartGame);
        client.on("ready for round", onReadyForRound);

        client.on("enter lobby", Lobby.onEnterLobby);
        client.on("host game", Lobby.onHostGame);
        client.on("select stage", Lobby.onStageSelect);
        client.on("enter pending game", Lobby.onEnterPendingGame);
        client.on("leave pending game", Lobby.onLeavePendingGame);
    });
};

function onClientDisconnect() {
    if (this.gameId == null) {
        return;
    }

    var lobbySlots = Lobby.getLobbySlots();

    if (lobbySlots[this.gameId].state == "joinable" || lobbySlots[this.gameId].state == "full") {
        Lobby.onLeavePendingGame.call(this);
    } else if (lobbySlots[this.gameId].state == "settingup") {
        lobbySlots[this.gameId].state = "empty";

        Lobby.broadcastSlotStateUpdate(this.gameId, "empty");
    } else if(lobbySlots[this.gameId].state == "inprogress") {
        var game = games[this.gameId];
        if(this.id in game.players) {
            console.log("deleting " + this.id);
            delete game.players[this.id];
        }

        if(game.numPlayers < 2) {
            if(game.numPlayers == 1) {
                io.in(this.gameId).emit("no opponents left");
            }
            terminateExistingGame(this.gameId);
        }

        if(game.awaitingAcknowledgements && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
            game.awaitingAcknowledgements = false;
        }
    }
};

// Deletes the game object and frees up the slot.
function terminateExistingGame(gameId) {
    delete games[gameId];

    Lobby.getLobbySlots()[gameId] = new PendingGame();

    Lobby.broadcastSlotStateUpdate(gameId, "empty");
};

function onStartGame() {
    var lobbySlots = Lobby.getLobbySlots();

    var game = new Game();
    games[this.gameId] = game;
    var pendingGame = lobbySlots[this.gameId];
    lobbySlots[this.gameId].state = "inprogress";

    Lobby.broadcastSlotStateUpdate(this.gameId, "inprogress");

//TODO this block in method
    var ids = pendingGame.getPlayerIds();

    var playerOneId = ids[0];
    var playerOneSpawnPoint = {
        x: GAME_WIDTH/2,
        y: GAME_HEIGHT - GAME_HEIGHT/2 * 0.15
    };
    var playerOne = new Player(
        playerOneSpawnPoint.x,
        playerOneSpawnPoint.y,
        playerOneId
    );

    playerOne.spawnPoint = playerOneSpawnPoint;
    game.players[playerOneId] = playerOne;

    var playerTwoId = ids[1];
    var playerTwoSpawnPoint = {
        x: GAME_WIDTH/2,
        y: GAME_HEIGHT/2 * 0.1
    };
    var playerTwo = new Player(
        playerTwoSpawnPoint.x,
        playerTwoSpawnPoint.y,
        playerTwoId
    );

    playerTwo.spawnPoint = playerTwoSpawnPoint;
    game.players[playerTwoId] = playerTwo;
//END block

    game.numPlayersAlive = ids.length;

    io.in(this.gameId).emit("start game on client", {mapName: pendingGame.mapName, players: game.players});
};

function onMovePlayer(data) {
    var game = games[this.gameId];

    if(game === undefined || game.awaitingAcknowledgements) {
        return;
    }

    var movingPlayer = game.players[this.id];

    // Moving player can be null if a player is killed and leftover movement signals come through.
    if(!movingPlayer) {
        return;
    }

    movingPlayer.x = data.x;
    movingPlayer.timeMovement = data.timeMovement;

    //if (movingPlayer.timeMovement > )
    io.to(this.gameId).emit("m", {id: movingPlayer.id, x: movingPlayer.x, timeMovement: data.timeMovement});
    //movingPlayer.hasMoved = true;
};

function handlePlayerDeath(deadPlayerIds, gameId) {
    var tiedWinnerIds;

    if(deadPlayerIds.length > 1 && games[gameId].numPlayersAlive - deadPlayerIds.length == 0) {
        tiedWinnerIds = deadPlayerIds;
    }

    deadPlayerIds.forEach(function(deadPlayerId) {
        games[gameId].players[deadPlayerId].alive = false;
        io.in(gameId).emit("kill player", {id: deadPlayerId});
        games[gameId].numPlayersAlive--;
    }, this);

    if(games[gameId].numPlayersAlive <= 1) {
        endRound(gameId, tiedWinnerIds);
    }
};

function endRound(gameId, tiedWinnerIds) {
    var roundWinnerColors = [];

    var game = games[gameId];

    if(tiedWinnerIds) {
        tiedWinnerIds.forEach(function(tiedWinnerId) {
            roundWinnerColors.push(game.players[tiedWinnerId].color);
        });
    } else {
        var winner = game.calculateRoundWinner();
        winner.wins++;
        roundWinnerColors.push(winner.color);
    }

    game.currentRound++;

    if(game.currentRound > 2) {
        var gameWinners = game.calculateGameWinners();

        if(gameWinners.length == 1 && (game.currentRound > 3 || gameWinners[0].wins == 2)) {
            io.in(gameId).emit("end game", {completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors, 
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(gameId);
            return;
        }
    }

    game.awaitingAcknowledgements = true;
    game.resetForNewRound();


    io.in(gameId).emit("new round", {completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors});
};

function onReadyForRound() {
    var game = games[this.gameId];

    if(!game.awaitingAcknowledgements) {
        return;
    }

    game.acknowledgeRoundReadinessForPlayer(this.id);

    if(game.numRoundReadinessAcknowledgements >= game.numPlayers) {
        game.awaitingAcknowledgements = false;
    }
};

function broadcastingLoop() {
    for(var g in games) {
        var game = games[g];
        for(var i in game.players) {
            var player = game.players[i];
            if(player.hasMoved) {
                //io.to(g).emit("m", {id: player.id, x: player.x});
                //player.hasMoved = false;
            }
        }
    }
};

app.use(function(req, res, next) {
    if (req.url == "/") {
        res.render('index');
    }
    else {
        next();
    }
});

if (app.get('env') == 'dev') {
    app.use(errorhandler());
}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//development error handler
//will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({ error:  err.message });
    });
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ error:  err.message });
});
