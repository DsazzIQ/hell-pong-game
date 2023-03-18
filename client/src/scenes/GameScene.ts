import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Socket } from 'socket.io-client';
import {PADDLE_SPEED} from "@shared/constants";
import IGameState from "@shared/types/IGameState";
import IPlayer from "@shared/types/IPlayer";

interface GamePlayer {
  id: string;
  paddle: Phaser.Physics.Arcade.Sprite;
}
export default class GameScene extends BaseScene {
  private roomId!: string;
  private initData!: IGameState;

  private ball!: Phaser.Physics.Arcade.Image;
  private players: GamePlayer[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private playersScoreText!: Phaser.GameObjects.Text;

  private socket!: Socket;

  constructor() {
    super('Game');
  }

  // @ts-ignore
  public init(data: IGameState): void {
    super.init();
    this.roomId = data.roomId;
    this.initData = data;
    this.socket = this.registry.get('socket') as Socket;
  }

  public create(): void {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;
    this.physics.world.setBounds(0, 0, width, height);

    // Add background
    this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'textures', 'background/background-1').setOrigin(0);

    // Add ball
    this.ball = this.physics.add.image(this.centerX, this.centerY, 'textures', 'gameplay/ball')
      .setOrigin(0.5)
      .setCollideWorldBounds(true)
      .setBounce(1, 1);

    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up score display
    this.playersScoreText = this.add.text(this.centerX, 20, `0 - 0`, { fontFamily: 'arcade-zig', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

    // Listen for game updates from the server
    this.socket.on('gameStateUpdate', (data: IGameState) => {
      // Update the positions of the players and ball based on the server data
      this.ball.x = data.ball.position.x;
      this.ball.y = data.ball.position.y;

      // Update player positions
      data.players.forEach((playerData: IPlayer) => {
        const player = this.findPlayer(playerData.id);
        if (player) {
          player.paddle.setPosition(playerData.paddle.position.x, playerData.paddle.position.y);
        }
      });
    });

    console.log('[GameScene:startGame] create', this.initData);
    this.players = this.initData.players.map((playerData) => {
      const paddle = this.physics.add.sprite(playerData.paddle.position.x, playerData.paddle.position.y, 'textures', 'gameplay/paddle')
        .setOrigin(0.5)
        .setImmovable(true)
        .setCollideWorldBounds(true);

      return {
        id: playerData.id,
        paddle: paddle
      };
    });
  }

  private getLocalPlayer(): GamePlayer | undefined {
    return this.findPlayer(this.socket.id);
  }

  private findPlayer(id: string): GamePlayer | undefined {
    return this.players.find(p => p.id === id);
  }

  public update(): void {
    const localPlayer = this.getLocalPlayer();
    if (localPlayer) {
      if (this.cursors.up.isDown) {
        localPlayer.paddle.setVelocityY(-PADDLE_SPEED);
      } else if (this.cursors.down.isDown) {
        localPlayer.paddle.setVelocityY(PADDLE_SPEED);
      } else {
        localPlayer.paddle.setVelocityY(0);
      }

      this.socket.emit('playerMoved', {
        roomId: this.roomId,
        y: localPlayer.paddle.y,
      });
    }
  }
}
