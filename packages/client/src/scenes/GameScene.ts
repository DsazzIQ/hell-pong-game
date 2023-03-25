import {
  BALL_RADIUS,
  GAME_HEIGHT,
  GAME_UPDATE_INTERVAL,
  GAME_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH
} from '@hell-pong/shared/constants';
import { Position } from '@hell-pong/shared/entities/component/Position';
import GameState, { IGameState } from '@hell-pong/shared/gameData/GameState';
import {
  IPlayer,
  PlayerIndex,
  PlayerMove
} from '@hell-pong/shared/gameData/Player';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { Pane } from 'tweakpane';

import { BaseScene } from './BaseScene';

const ALPHA_THRESHOLD = 1;
const MIN_BUFFER_SIZE_INTERPOLATION = 2;
const MAX_BUFFER_SIZE = 5;

interface GamePlayer {
  id: string;
  index: PlayerIndex;
  paddle: Phaser.Physics.Matter.Image;
}
export default class GameScene extends BaseScene {
  private roomId!: string;
  private initData!: IGameState;

  private ball!: Phaser.Physics.Matter.Image;
  private players: GamePlayer[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private playersScoreText!: Phaser.GameObjects.Text;

  private socket!: Socket;

  private gameStateBuffer: IGameState[] = [];

  private lastReceivedTime: number | null = null;

  private pane!: Pane;

  private isPaused = false;

  constructor() {
    super('Game');
  }

  public init(data: IGameState): void {
    super.init();
    this.roomId = data.roomId;
    this.initData = data;
    this.socket = this.registry.get<Socket>('socket');
    this.pane = new Pane({
      title: 'GameState'
    });
    this.pane.addMonitor(this.game.loop, 'actualFps', { view: 'graph' });
    this.pane
      .addFolder({ title: 'Buffer Size' })
      .addMonitor(this.gameStateBuffer, 'length');
  }

  private handleVisibilityChange(): void {
    console.log('[handleVisibilityChange] set game on pause', document.hidden);
    this.isPaused = document.hidden;
  }

  private initBall(): void {
    this.ball = this.matter.add.sprite(
      this.initData.ball.position.x,
      this.initData.ball.position.y,
      'textures',
      'gameplay/ball'
    );
    this.ball.setCircle(BALL_RADIUS);

    this.ball.setFrictionAir(0);
    this.ball.setFriction(0);

    this.ball.setBounce(1);
    this.ball.setOrigin(0.5);
    this.ball.setName('ball');
  }

  private initBackground(): void {
    this.add
      .tileSprite(
        0,
        0,
        this.game.canvas.width,
        this.game.canvas.height,
        'textures',
        'background/background-1'
      )
      .setOrigin(0);
  }

  private initGameScore(): void {
    this.playersScoreText = this.add
      .text(this.centerX, 20, `0 - 0`, {
        fontFamily: 'arcade-zig',
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setName('score');
  }

  private initPlayers(): void {
    this.players = this.initData.players.map((player) => {
      const paddle = this.matter.add.sprite(
        player.paddle.position.x,
        player.paddle.position.y,
        'textures',
        'gameplay/paddle'
      );
      paddle.setRectangle(PADDLE_WIDTH, PADDLE_HEIGHT);
      paddle.setStatic(true);
      // paddle.setFrictionAir(0);
      paddle.setBounce(1);
      paddle.setOrigin(0.5);
      paddle.setName(`paddle-${player.index + 1}`);

      return { id: player.id, index: player.index, paddle };
    });
  }

  private initDebugMonitor(): void {
    const ballFolder = this.pane.addFolder({
      title: 'Ball'
    });
    ballFolder.addMonitor(this.ball, 'x', { bufferSize: 100 });
    ballFolder.addMonitor(this.ball, 'y', { bufferSize: 100 });

    this.players.map((player) => {
      const playerFolder = this.pane.addFolder({
        title: `Player ${player.index + 1}`
      });
      playerFolder.addMonitor(player.paddle, 'x', { bufferSize: 100 });
      playerFolder.addMonitor(player.paddle, 'y', { bufferSize: 100 });
    });
  }

  public create(): void {
    this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 1);

    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    this.initBackground();

    this.initGameScore();
    this.initBall();
    this.initPlayers();

    this.initDebugMonitor();

    // Listen for game updates from the server and handle server reconciliation
    this.socket.on('gameStateUpdate', (gameState: IGameState) => {
      this.onGameStateUpdate(gameState);
    });

    // Add visibility change event listeners
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
  }

  private getLocalPlayer(): GamePlayer | undefined {
    return this.findPlayer(this.socket.id);
  }

  private findPlayer(id: string): GamePlayer | undefined {
    return this.players.find((p) => p.id === id);
  }

  private handlePlayerMovement() {
    const localPlayer = this.getLocalPlayer();
    if (!localPlayer) {
      console.log('[handlePlayerMovement] no local player');
      return;
    }
    let key: PlayerMove = PlayerMove.STOP;
    if (this.cursors.up.isDown) {
      key = PlayerMove.UP;
    }
    if (this.cursors.down.isDown) {
      key = PlayerMove.DOWN;
    }

    this.socket.emit('playerMoved', { key });
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
    return this.getCurrentTime() - this.lastReceivedTime;
  }

  private calculateInterpolationAlpha(): number {
    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const timeDifference =
      nextState.lastUpdateTime - previousState.lastUpdateTime;
    if (!timeDifference) {
      return 0;
    }
    return this.calculateInterpolationDelta() / timeDifference;
  }

  handleInterpolationCompletion(alpha: number) {
    if (
      alpha >= ALPHA_THRESHOLD &&
      this.calculateInterpolationDelta() > GAME_UPDATE_INTERVAL
    ) {
      this.gameStateBuffer.shift();
      this.lastReceivedTime = this.getCurrentTime();
    }
  }

  private clearOldGameBufferOnMaxSize() {
    // Buffer management: remove the oldest state if the buffer size exceeds the limit
    if (this.gameStateBuffer.length > MAX_BUFFER_SIZE) {
      this.gameStateBuffer.shift();
    }
  }

  private applyServerReconciliation() {
    if (
      !this.lastReceivedTime ||
      this.gameStateBuffer.length < MIN_BUFFER_SIZE_INTERPOLATION
    ) {
      console.log('[applyServerReconciliation]: skip');
      return;
    }

    this.clearOldGameBufferOnMaxSize();

    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const interpolationAlpha = this.calculateInterpolationAlpha();

    // Update the positions of the players and ball based on the server data
    const ballPosition = Position.fromJson(
      previousState.ball.position
    ).interpolateXY(
      nextState.ball.position.x,
      nextState.ball.position.y,
      interpolationAlpha
    );
    this.ball.setPosition(ballPosition.x, ballPosition.y);

    // Update player positions
    previousState.players.forEach((playerData: IPlayer) => {
      const player = this.findPlayer(playerData.id);
      if (player) {
        const nextPlayerData = nextState.players.find(
          (p) => p.id === playerData.id
        );
        if (nextPlayerData) {
          const paddlePosition = Position.fromJson(
            playerData.paddle.position
          ).interpolate(
            Position.fromJson(nextPlayerData.paddle.position),
            interpolationAlpha
          );
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
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
    // ...rest of the destroy method
  }
}
