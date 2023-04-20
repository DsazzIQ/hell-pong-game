import { GameConstant as GameConstants } from '@hell-pong/shared/constants/game';
import { Position } from '@hell-pong/shared/entities/component/Position';
import GameState, { IGameState } from '@hell-pong/shared/gameData/GameState';
import { IPlayer, PlayerIndex, PlayerMove } from '@hell-pong/shared/gameData/Player';
import { Physics, Scene, Types } from 'phaser';
import { Socket } from 'socket.io-client';
import { Pane } from 'tweakpane';

import FontFamily from '../constants/FontFamily';
import FontSize from '../constants/FontSize';
import RegistryKey from '../constants/RegistryKey';
import SceneKey from '../constants/SceneKey';
import TextureKey from '../constants/TextureKey';
import Game from '../Game';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { ClientToServerEvents, ServerToClientEvents } from '@hell-pong/shared/types/socket.io';
import logger from '../logger';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';

const ALPHA_THRESHOLD = 1;
const MIN_BUFFER_SIZE_INTERPOLATION = 2;
const MAX_BUFFER_SIZE = 5;

interface GamePlayer {
  id: string;
  index: PlayerIndex;
  paddle: Physics.Matter.Image;
}
export default class GameScene extends Scene {
  private initData!: IGameState;

  private ball!: Physics.Matter.Image;
  private players: GamePlayer[] = [];
  private cursors?: Types.Input.Keyboard.CursorKeys;

  // private playersScoreText!: GameObjects.Text;

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  private gameStateBuffer: IGameState[] = [];

  private lastReceivedTime: number | null = null;

  private pane!: Pane;

  private isPaused = true;

  constructor() {
    super(SceneKey.Game);
  }

  private stopGame() {
    this.pauseGame();
    this.pane.dispose();
    this.lastReceivedTime = null;
    this.gameStateBuffer.length = 0;

    this.players.forEach((player) => player.paddle.destroy());
    this.ball.destroy();

    this.initData = {
      roomId: '',
      ball: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      players: [],
      lastUpdateTime: 0
    };
  }

  private pauseGame() {
    this.isPaused = true;
  }

  private continueGame() {
    this.isPaused = false;
  }

  public init(data: IGameState): void {
    this.continueGame();
    logger.debug('>> init Game scene <<', data);

    this.initData = data;
    this.socket = this.registry.get(RegistryKey.Socket) as Socket<ServerToClientEvents, ClientToServerEvents>;

    this.pane = new Pane({
      title: 'GameState'
    });
    this.pane.addMonitor(this.game.loop, 'actualFps', { view: 'graph' });
    this.pane.addFolder({ title: 'Buffer Size' }).addMonitor(this.gameStateBuffer, 'length');
  }

  private handleVisibilityChange(): void {
    console.info(`set game on pause: ${document.hidden}`);
    this.isPaused = document.hidden;
  }

  private initBall(): void {
    this.ball = this.matter.add.sprite(
      this.initData.ball.position.x,
      this.initData.ball.position.y,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Gameplay.Ball
    );
    this.ball.setCircle(GameConstants.Ball.Radius);

    this.ball.setFrictionAir(0);
    this.ball.setFriction(0);

    this.ball.setBounce(1);
    this.ball.setOrigin(0.5);
    this.ball.setName(TextureKey.Gui.Frames.Gameplay.Ball);
  }

  private initBackground(): void {
    this.add
      .tileSprite(
        0,
        0,
        this.game.canvas.width,
        this.game.canvas.height,
        TextureKey.Background.Key,
        TextureKey.Background.Frames.Main
      )
      .setOrigin(0);
  }

  private initGameScore(): void {
    this.add
      .text(this.game.canvas.width * 0.5, 20, `0 - 0`, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.Title,
        color: colorToHex(Color.White)
      })
      .setOrigin(0.5)
      .setName('score');
  }

  private initPlayers(): void {
    this.players = this.initData.players.map((player) => {
      const paddle = this.matter.add.sprite(
        player.paddle.position.x,
        player.paddle.position.y,
        TextureKey.Gui.Key,
        TextureKey.Gui.Frames.Gameplay.Paddle
      );
      paddle.setRectangle(GameConstants.Paddle.Width, GameConstants.Paddle.Height);
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
    this.matter.world.setBounds(0, 0, GameConstants.Width, GameConstants.Height, 1);

    // Set up keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    this.initBackground();

    this.initGameScore();
    this.initBall();
    this.initPlayers();

    this.initDebugMonitor();

    // Listen for game updates from the server and handle server reconciliation
    this.socket.on(SocketEvents.Game.StateUpdate, (gameState: IGameState) => {
      this.onGameStateUpdate(gameState);
    });

    this.socket.once(SocketEvents.Game.Stopped, () => {
      const { startTransition } = this.game as Game;
      this.stopGame();
      startTransition(this, SceneKey.Lobby);
    });

    // Add visibility change event listeners
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
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
      logger.error(`not found local player [${this.socket.id}] in the current room`);
      return;
    }
    let key: PlayerMove = PlayerMove.STOP;
    if (this.cursors?.up.isDown) {
      key = PlayerMove.UP;
    }
    if (this.cursors?.down.isDown) {
      key = PlayerMove.DOWN;
    }

    this.socket.emit(SocketEvents.Game.PlayerMoved, key);
  }

  private getCurrentTime() {
    return Date.now();
  }

  private onGameStateUpdate(gameState: GameState): void {
    if (this.isPaused) {
      // Don't update the game loop if the game is paused
      logger.info('Prevent state updating. Game is on pause');
      return;
    }
    this.addToBuffer(gameState);
    this.lastReceivedTime = this.getCurrentTime();
  }

  private addToBuffer(gameState: GameState) {
    this.gameStateBuffer.push(gameState);

    if (this.gameStateBuffer.length > MAX_BUFFER_SIZE) {
      this.gameStateBuffer.shift(); // remove the oldest element
    }
  }

  private calculateInterpolationDelta() {
    if (!this.lastReceivedTime) return 0;
    return this.getCurrentTime() - this.lastReceivedTime;
  }

  private calculateInterpolationAlpha(): number {
    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const timeDifference = nextState.lastUpdateTime - previousState.lastUpdateTime;
    if (!timeDifference) {
      return 0;
    }
    return this.calculateInterpolationDelta() / timeDifference;
  }

  handleInterpolationCompletion(alpha: number) {
    if (alpha >= ALPHA_THRESHOLD && this.calculateInterpolationDelta() > GameConstants.UpdateInterval) {
      this.gameStateBuffer.shift();
      this.lastReceivedTime = this.getCurrentTime();
    }
  }

  private applyServerReconciliation() {
    if (!this.lastReceivedTime || this.gameStateBuffer.length < MIN_BUFFER_SIZE_INTERPOLATION) {
      logger.warn('not enough data for server reconciliation');
      return;
    }

    const previousState = this.gameStateBuffer[0];
    const nextState = this.gameStateBuffer[1];

    const interpolationAlpha = this.calculateInterpolationAlpha();

    // Update the positions of the players and ball based on the server data
    const ballPosition = Position.fromJson(previousState.ball.position).interpolateXY(
      nextState.ball.position.x,
      nextState.ball.position.y,
      interpolationAlpha
    );
    this.ball.setPosition(ballPosition.x, ballPosition.y);

    // Update player positions
    previousState.players.forEach((playerData: IPlayer) => {
      const player = this.findPlayer(playerData.id);
      if (player) {
        const nextPlayerData = nextState.players.find((p) => p.id === playerData.id);
        if (nextPlayerData) {
          const paddlePosition = Position.fromJson(playerData.paddle.position).interpolate(
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
      logger.info('Prevent game loop updating. Game is on pause');
      return;
    }

    this.handlePlayerMovement();
    this.applyServerReconciliation();
  }

  public destroy(): void {
    // Remove the visibility change event listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.stopGame();
    // ...rest of the destroy method
  }
}
