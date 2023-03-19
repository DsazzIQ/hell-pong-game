import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import { Socket } from 'socket.io-client';
import {CLIENT_UPDATE_INTERVAL, GAME_HEIGHT, GAME_WIDTH, PADDLE_SPEED} from "@shared/constants";
import GameState, {IGameState} from "@shared/gameData/GameState";
import {IPlayer} from "@shared/gameData/Player";
import {Position} from "@shared/entities/component/Position";
import { Pane } from 'tweakpane';

const ALPHA_THRESHOLD = 1;
const MIN_BUFFER_SIZE_INTERPOLATION = 2;
const MAX_BUFFER_SIZE = 5;

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

  private gameStateBuffer: IGameState[] = [];

  private lastReceivedTime: number | null = null;

  private pane!: Pane;

  private isPaused: boolean = false;

  constructor() {
    super('Game');
  }

  // @ts-ignore
  public init(data: IGameState): void {
    super.init();
    this.roomId = data.roomId;
    this.initData = data;

    this.socket = this.registry.get('socket') as Socket;
    this.pane = new Pane({
      title: 'GameState',
    });
    this.pane.addMonitor(this.game.loop, 'actualFps', {   view: 'graph' });
    this.pane.addFolder({ title: 'Buffer Size'}).addMonitor(this.gameStateBuffer, 'length');
  }

  private handleVisibilityChange(): void {
    console.log('[handleVisibilityChange] set game on pause', document.hidden)
    this.isPaused = document.hidden;
  }

  public create(): void {
    console.log('[GameScene:create] init data', this.initData);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add background
    this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'textures', 'background/background-1')
      .setOrigin(0)
      .setName('score')
    ;

    // Add ball
    this.ball = this.physics.add.sprite(this.initData.ball.position.x, this.initData.ball.position.y, 'textures', 'gameplay/ball')
      .setOrigin(0.5)
      .setCollideWorldBounds(true)
      .setName('ball')
    ;
    const ballFolder = this.pane.addFolder({
      title: 'Ball',
    });
    ballFolder.addMonitor(this.ball, 'x', { bufferSize: 100 });
    ballFolder.addMonitor(this.ball, 'y', { bufferSize: 100 });

    // Set up score display
    this.playersScoreText = this.add.text(this.centerX, 20, `0 - 0`, { fontFamily: 'arcade-zig', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

    this.players = this.initData.players.map((playerData) => {
      const paddle = this.physics.add.sprite(playerData.paddle.position.x, playerData.paddle.position.y, 'textures', 'gameplay/paddle')
        .setOrigin(0.5)
        .setImmovable(true)
        .setCollideWorldBounds(true)
        .setName(`paddle-${playerData.index}`)
      ;
      const playerFolder = this.pane.addFolder({
        title: `Player ${playerData.index}`,
      });
      playerFolder.addMonitor(paddle, 'x', { bufferSize: 100 });
      playerFolder.addMonitor(paddle, 'y', { bufferSize: 100 });

      return {
        id: playerData.id,
        paddle: paddle
      };
    });

    // Listen for game updates from the server and handle server reconciliation
    this.socket.on('gameStateUpdate', (gameState: IGameState) => {
      this.onGameStateUpdate(gameState);
    });

    // Add visibility change event listeners
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private getLocalPlayer(): GamePlayer | undefined {
    return this.findPlayer(this.socket.id);
  }

  private findPlayer(id: string): GamePlayer | undefined {
    return this.players.find(p => p.id === id);
  }

  private handlePlayerMovement() {
    const localPlayer = this.getLocalPlayer();
    if (!localPlayer) {
      console.log('[handlePlayerMovement] no local player')
      return;
    }

    let newVelocityY = 0;
    if (this.cursors.up.isDown) {
      newVelocityY = -PADDLE_SPEED;
    }
    if (this.cursors.down.isDown) {
      newVelocityY = PADDLE_SPEED;
    }
    localPlayer.paddle.setVelocityY(newVelocityY);

    // this.socket.emit('playerMoved', { y: localPlayer.paddle.y });
    this.socket.emit('playerMoved', { newVelocityY });
  }

  private getCurrentTime() {
    return Date.now();
  }

  private onGameStateUpdate(gameState: GameState): void {
    if (this.isPaused) {
      // Don't update the game loop if the game is paused
      console.log('[onGameStateUpdate] game is on pause');
      return;
    }
    this.gameStateBuffer.push(gameState);
    this.lastReceivedTime = this.getCurrentTime();
  }

  private calculateInterpolationDelta() {
    if (!this.lastReceivedTime) return 0;
    return (this.getCurrentTime() - this.lastReceivedTime);
  }

  private calculateInterpolationAlpha(): number {
    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const timeDifference = nextState.lastUpdateTime - previousState.lastUpdateTime;
    if (!timeDifference) { return 0; }
    return this.calculateInterpolationDelta() / timeDifference;
  }

  private calculateUpdateInterval() {
    return CLIENT_UPDATE_INTERVAL;// 1000 / GAME_FPS;
  }

  handleInterpolationCompletion(alpha: number) {
    if (alpha >= ALPHA_THRESHOLD && this.calculateInterpolationDelta() > this.calculateUpdateInterval()) {
      this.gameStateBuffer.shift();
      this.lastReceivedTime = this.getCurrentTime();
    }
  }

  private clearOldGameBufferOnMaxSize() {
    // Buffer management: remove the oldest state if the buffer size exceeds the limit
    if (this.gameStateBuffer.length > MAX_BUFFER_SIZE) {
      // console.log('[applyServerReconciliation]: buffer size exceeded, removing oldest state');
      this.gameStateBuffer.shift();
    }
  }

  private applyServerReconciliation() {
    if (!this.lastReceivedTime || this.gameStateBuffer.length < MIN_BUFFER_SIZE_INTERPOLATION) {
      console.log('[applyServerReconciliation]: skip');
      return;
    }

    this.clearOldGameBufferOnMaxSize();

    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const interpolationAlpha = this.calculateInterpolationAlpha();

    // Update the positions of the players and ball based on the server data
    const ballPosition = Position.fromJson(previousState.ball.position).interpolateXY(nextState.ball.position.x, nextState.ball.position.y, interpolationAlpha);
    this.ball.setPosition(ballPosition.x, ballPosition.y);

    // Update player positions
    previousState.players.forEach((playerData: IPlayer) => {
      const player = this.findPlayer(playerData.id);
      if (player) {
        const nextPlayerData = nextState.players.find(p => p.id === playerData.id);
        if (nextPlayerData) {
          const paddlePosition = Position.fromJson(playerData.paddle.position).interpolateXY(nextPlayerData.paddle.position.x, nextPlayerData.paddle.position.y, interpolationAlpha);
          player.paddle.setPosition(paddlePosition.x, paddlePosition.y);
        }
      }
    });

    this.handleInterpolationCompletion(interpolationAlpha);
  }

  public update(): void {
    if (this.isPaused) {
      // Don't update the game loop if the game is paused
      return;
    }

    this.handlePlayerMovement();
    this.applyServerReconciliation();
  }

  public destroy(): void {
    // Remove the visibility change event listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    // ...rest of the destroy method
  }
}
