var Lobby = function() {};
var repeatingLavaTilesprite;

module.exports = Lobby;

Lobby.prototype = {
    init: function(rbts) {
        repeatingLavaTilesprite = rbts;
    },

    create: function() {
        this.stateSettings = {
            empty: {
                outFrame: "lobby/slots/slot_01",
                overFrame: "lobby/slots/slot_02",
                text: "Host Game ", // For some reason, text gets slightly truncated if I don't append a space.
                callback: this.hostGameAction
            },
            joinable: {
                outFrame: "lobby/slots/slot_03",
                overFrame: "lobby/slots/slot_04",
                text: "Join Game ",
                callback: this.joinGameAction
            },
            settingup: {
                outFrame: "lobby/slots/slot_05",
                overFrame: "lobby/slots/slot_05",
                text: "Game is being set up... ",
                callback: null
            },
            inprogress: {
                outFrame: "lobby/slots/slot_05",
                overFrame: "lobby/slots/slot_05",
                text: "Game in Progress ",
                callback: null
            },
            full: {
                outFrame: "lobby/slots/slot_05",
                overFrame: "lobby/slots/slot_05",
                text: "Game Full ",
                callback: null
            }
        };

        if(repeatingLavaTilesprite == null) {
            repeatingLavaTilesprite = game.add.tileSprite(0, 0, 480, 640, "pong_textures", "lobby/lobby_bg");
        }

        repeatingLavaTilesprite.doNotDestroy = true;

        this.backdrop = game.add.image(20, 25, "pong_textures", "lobby/lobby_backdrop");
        this.header = game.add.bitmapText(
            this.backdrop.width/2, 
            this.backdrop.height * 0.1, 
            "retro_font",
            "Lobby",
            25
        );
        this.header.anchor.set(0.5);
        this.backdrop.addChild(this.header);

        this.slots = [];
        this.labels = [];

        var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];

        socket.emit("enter lobby");

        if(!socket.hasListeners("add slots")) {
            socket.on("add slots", this.addSlots.bind(this));
            socket.on("update slot", this.updateSlot.bind(this));
        }
    },

    update: function() {
        repeatingLavaTilesprite.tilePosition.x++;
        repeatingLavaTilesprite.tilePosition.y--;
    },

    addSlots: function(gameData) {
        if(this.slots.length > 0)  // TODO: get rid of this
            return;

        var initialSlotYOffset = this.backdrop.height * 0.2;
        var slotXOffset = this.backdrop.width/2 * 0.1;
        var lobbySlotDistance = 60;

        for(var i = 0; i < gameData.length; i++) {
            var callback = null;
            var state = gameData[i].state;
            var settings = this.stateSettings[state];

            (function(n, fn) {
                if(fn != null) {
                    callback = function() {
                        fn(n);
                    }
                }
            })(i, settings.callback);

            var slotYOffset = initialSlotYOffset + i * lobbySlotDistance;
            this.slots[i] = game.add.button(slotXOffset, slotYOffset, "pong_textures", callback, null, settings.overFrame, settings.outFrame);
            this.slots[i].setDownSound(buttonClickSound);
            
            var text = game.add.bitmapText(
                this.slots[i].width/2+5, 
                this.slots[i].height/2, 
                "retro_font",
                settings.text,
                20
            );
            text.anchor.set(0.5);
            
            this.slots[i].addChild(text);
            this.backdrop.addChild(this.slots[i]);

            this.labels[i] = text;
        }
    },

    hostGameAction: function(gameId) {
        socket.emit("host game", {gameId: gameId});
        socket.removeAllListeners();
        game.state.start("StageSelect", true, false, gameId, repeatingLavaTilesprite);
    },

    joinGameAction: function(gameId) {
        socket.removeAllListeners();
        game.state.start("PendingGame", true, false, null, gameId, repeatingLavaTilesprite);
    },

    updateSlot: function(updateInfo) {
        var settings = this.stateSettings[updateInfo.newState];
        var id = updateInfo.gameId;
        var button = this.slots[id];

        this.labels[id].text = settings.text;
        button.setFrames(settings.overFrame, settings.outFrame);

        // Change callback of button
        button.onInputUp.removeAll();
        button.onInputUp.add(function() { return settings.callback(id)}, this);
    }
};
