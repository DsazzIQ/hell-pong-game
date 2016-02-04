var StageSelect = function() {};

module.exports = StageSelect;

var repeatingLavaTilesprite;

var stages = [
    {name: "Limitless Brook", thumbnailKey: "thumbnails/limitless_brook_thumbnail.png", tilemapName: "levelOne", maxPlayers: 4, size: "small"},
    {name: "Danger Desert", thumbnailKey: "thumbnails/danger_desert_thumbnail.png", tilemapName: "levelTwo", maxPlayers: 4, size: "medium"}
];

StageSelect.prototype = {
    init: function(gameId, rbts) {
        repeatingLavaTilesprite = rbts;
        this.gameId = gameId;
    },

    create: function() {
        this.backdrop = game.add.image(20, 25, "pong_textures", "lobby/lobby_backdrop");
        var backdropCenterX = this.backdrop.width/2;

        this.header = game.add.image(backdropCenterX, this.backdrop.height * 0.1, "pong_textures", "lobby/header");
        this.header.anchor.set(0.5);
        var headerText = game.add.bitmapText(
            0,
            3,
            "retro_font",
            "Select stage",
            30
        );
        headerText.anchor.set(0.5);
        this.header.addChild(headerText);

        this.selectedStageIndex = 0;
        var initialStage = stages[this.selectedStageIndex];

        this.leftButton = game.add.button(this.backdrop.width * 0.1, 180, "pong_textures", this.leftSelect, this, "button/left_select_button_02", "button/left_select_button_01");
        this.rightButton = game.add.button(this.backdrop.width * 0.75, 180, "pong_textures", this.rightSelect, this, "button/right_select_button_02", "button/right_select_button_01");
        this.okButton = game.add.button(this.backdrop.width * 0.8, this.backdrop.height * 0.85, "pong_textures", this.confirmStageSelection, this, "button/ok_button_02", "button/ok_button_01");

        this.leftButton.setDownSound(buttonClickSound);
        this.rightButton.setDownSound(buttonClickSound);
        this.okButton.setDownSound(buttonClickSound);

        this.thumbnail = game.add.image(backdropCenterX, this.backdrop.height/2 * 0.75, TEXTURES, initialStage.thumbnailKey);
        this.thumbnail.anchor.set(0.5);

        // Display title
        this.stageNameText = game.add.bitmapText(
            backdropCenterX,
            this.backdrop.height * 0.22,
            "retro_font",
            initialStage.name,
            30
        );
        this.stageNameText.anchor.set(0.5);

        this.backdrop.addChild(this.header);
        this.backdrop.addChild(this.thumbnail);
        this.backdrop.addChild(this.leftButton);
        this.backdrop.addChild(this.rightButton);
        this.backdrop.addChild(this.okButton);
        this.backdrop.addChild(this.stageNameText);
    },

    leftSelect: function() {
        if(this.selectedStageIndex === 0) {
            this.selectedStageIndex = stages.length - 1;
        } else {
            this.selectedStageIndex--;
        }

        this.updateStageInfo();
    },

    rightSelect: function() {
        if(this.selectedStageIndex === stages.length - 1) {
            this.selectedStageIndex = 0;
        } else {
            this.selectedStageIndex++;
        }

        this.updateStageInfo();
    },

    update: function() {
        repeatingLavaTilesprite.tilePosition.x++;
        repeatingLavaTilesprite.tilePosition.y--;
    },

    updateStageInfo: function() {
        var newStage = stages[this.selectedStageIndex];
        this.stageNameText.text = newStage.name;
        this.thumbnail.loadTexture(TEXTURES, newStage.thumbnailKey);
    },

    confirmStageSelection: function() {
        var selectedStage = stages[this.selectedStageIndex];

        socket.emit("select stage", {mapName: selectedStage.tilemapName});
        game.state.start("PendingGame", true, false, selectedStage.tilemapName, this.gameId, repeatingLavaTilesprite);
    }
};
