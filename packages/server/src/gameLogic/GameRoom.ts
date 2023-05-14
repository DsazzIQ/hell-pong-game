import { Ball } from '@hell-pong/shared/entities/Ball';
import GameState, { IGameState } from '@hell-pong/shared/gameData/GameState';
import Player, { PlayerIndex } from '@hell-pong/shared/gameData/Player';
import { Bodies, Body, Engine, Events, Pair, World } from 'matter-js';
import { Server } from 'socket.io';
import { GameConstant } from '@hell-pong/shared/constants/game';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import logger from '../logger';
import { IRoomInfo, RoomInfo } from '@hell-pong/shared/gameData/RoomInfo';

export default class GameRoom {
  readonly id: string;
  private players: Player[] = [];
  private ball!: Ball;

  private engine!: Engine;
  private world!: World;
  private topWall!: Body;
  private bottomWall!: Body;
  private leftWall!: Body;
  private rightWall!: Body;

  private lastUpdateTime = 0;
  private gameStarted = false;
  private gameOver = false;

  constructor(roomId: string, io: Server) {
    this.id = roomId;

    this.resetEngine(io);
  }

  private resetEngine(io: Server): void {
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    this.world = this.engine.world;
    this.setWorldBounds();

    this.initBall();

    this.initWorldCollisions(io);
  }

  private setWorldBounds(): void {
    // Create a boundary rectangle around the world
    const bounds = {
      x: 0,
      y: 0,
      width: GameConstant.Width,
      height: GameConstant.Height,
      thickness: Number.MAX_SAFE_INTEGER,
      options: {
        isStatic: true,
        restitution: 1.0
      }
    };

    this.bottomWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.bottomWall, {
      x: bounds.width * 0.5,
      y: bounds.height + bounds.thickness * 0.5
    });

    this.bottomWall.label = GameConstant.Wall.BottomLabel;

    this.leftWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.leftWall, {
      x: -bounds.thickness * 0.5,
      y: bounds.height * 0.5
    });
    this.leftWall.label = GameConstant.Wall.LeftLabel;

    this.rightWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.rightWall, {
      x: bounds.width + bounds.thickness * 0.5,
      y: bounds.height * 0.5
    });
    this.rightWall.label = GameConstant.Wall.RightLabel;

    this.topWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.topWall, {
      x: bounds.width * 0.5,
      y: -bounds.thickness * 0.5
    });
    this.topWall.label = GameConstant.Wall.TopLabel;

    World.add(this.world, [this.topWall, this.bottomWall, this.leftWall, this.rightWall]);
  }

  private initWorldCollisions(io: Server): void {
    Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair: Pair = pairs[i];
        this.ball.updateAfterCollisions(pair);
        if (this.ball.collidingWithHorizontalWalls(pair)) {
          if (this.ball.collidingWithLeftWall(pair)) {
            this.players[PlayerIndex.SECOND].incrementScore();
            logger.info(`add score to SECOND player`);
          }
          if (this.ball.collidingWithRightWall(pair)) {
            this.players[PlayerIndex.FIRST].incrementScore();
            logger.info(`add score to FIRST player`);
          }
          logger.info(`Game score: [${this.players[0].score} : ${this.players[1].score}]`);

          io.to(this.id).emit(
            SocketEvents.Game.ScoreUpdate,
            this.players[PlayerIndex.FIRST].score,
            this.players[PlayerIndex.SECOND].score
          );

          this.ball.resetPosition();
          this.checkForGameEnd(io);
        }
      }
    });

    Events.on(this.engine, 'beforeUpdate', (_) => {
      this.players.map((p) => p.paddle.preventMoving());
      this.ball.limitMaxSpeed();
    });
  }

  private initBall(): void {
    this.ball = new Ball();
    this.ball.addToWorld(this.world);
  }

  isGameStarted() {
    return this.gameStarted;
  }

  isGameOver() {
    return this.gameOver;
  }

  startGame(io: Server) {
    logger.info(`start game for the room [${this.id}]`);
    this.gameStarted = true;
    io.to(this.id).emit(SocketEvents.Game.Start, this.getGameState());
  }

  stopGame(io: Server): void {
    this.gameStarted = false;
    this.lastUpdateTime = 0;

    this.resetEngine(io);
    this.players.forEach((player) => {
      player.resetState(this.world);
    });

    io.to(this.id).emit(SocketEvents.Game.Stopped);
  }

  private checkForGameEnd(io: Server): void {
    for (const player of this.players) {
      if (player.isMaxScore()) {
        this.stopGame(io);
        this.gameOver = true;
      }
    }
  }

  isFull(): boolean {
    return this.players.length === GameConstant.Room.MaxPlayers;
  }

  arePlayersReady(): boolean {
    return this.isFull() && this.players.every((player: Player) => player.isReady());
  }

  isEmpty(): boolean {
    return this.players.length == 0;
  }

  private addPlayer(id: string): Player {
    const usedIndexes = this.players.map((player) => player.index);
    let playerIndex = PlayerIndex.FIRST;

    if (usedIndexes.includes(PlayerIndex.FIRST)) {
      playerIndex = PlayerIndex.SECOND;
    }

    const player = new Player(id, playerIndex);
    player.paddle.addToWorld(this.world);
    this.players.push(player);

    return player;
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some((player) => player.id === playerId);
  }

  findPlayer(playerId: string): Player | null {
    return this.players.find((player) => player.id === playerId) || null;
  }

  tryAddPlayer(playerId: string): boolean {
    if (this.hasPlayer(playerId)) {
      logger.warn(`player [${playerId}] already in the room [${this.id}]`);
      return false;
    }

    if (this.isFull()) {
      logger.warn(`the room [${this.id}] is full`);
      return false;
    }

    this.addPlayer(playerId);
    logger.info(`player [${playerId}] added to the room [${this.id}]`);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const playerIndex = this.players.findIndex((player) => player.id === playerId);

    if (playerIndex !== -1) {
      const player = this.players[playerIndex];
      player.paddle.removeFromWorld(this.world);
      this.players.splice(playerIndex, 1);
      return true;
    }

    return false;
  }

  private updateLastUpdateTime(): this {
    this.lastUpdateTime = this.getCurrentTime();
    return this;
  }

  private getCurrentTime() {
    return Date.now();
  }

  private calculateInterpolationDelta() {
    return this.getCurrentTime() - this.lastUpdateTime;
  }

  update(): this {
    // Update game state only if the time since the last update exceeds the game update interval
    const deltaTime = this.calculateInterpolationDelta();
    if (this.lastUpdateTime && deltaTime > GameConstant.UpdateInterval) {
      const correction = this.getCurrentTime() / this.lastUpdateTime;
      Engine.update(this.engine, deltaTime, correction);
    }
    this.updateLastUpdateTime();

    return this;
  }

  getGameState(): IGameState {
    return new GameState(this.id, this.ball, this.players, this.lastUpdateTime);
  }

  toJson(): IRoomInfo {
    return new RoomInfo(this.id, this.players).toJson();
  }
}
