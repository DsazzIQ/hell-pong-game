function GameOver() {
}

GameOver.prototype = {
	init: function(winnerName, winByDefault) {
		this.winnerName = winnerName;
		this.winByDefault = winByDefault;
	},

	create: function() {
		var textToDisplay = this.winByDefault 
			? "     No other players remaining.\n              You win by default." 
			: "       Game Over. Winner: " + this.winnerName;
		textToDisplay += "\n\nPress Enter to return to main menu.";
		var textObject = game.add.text(game.camera.width/2, game.camera.height/2, textToDisplay);
		textObject.anchor.set(0.5);
	},

	update: function() {
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.returnToLobby();
		}
	},

	returnToLobby: function() {
		game.state.start("Lobby");
	}
}

module.exports = GameOver;