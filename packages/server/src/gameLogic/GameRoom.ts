import { Ball } from '@hell-pong/shared/entities/Ball';
import GameState, { IGameState, IRoomInfo } from '@hell-pong/shared/gameData/GameState';
import Player, { PlayerIndex } from '@hell-pong/shared/gameData/Player';
import { Bodies, Body, Engine, Events, Pair, World } from 'matter-js';
import { Server } from 'socket.io';
import { Game } from '@hell-pong/shared/constants/game';
import { SocketEvents } from '@hell-pong/shared/constants/socket';

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

  constructor(roomId: string) {
    this.id = roomId;

    this.resetEngine();
  }

  private resetEngine(): void {
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    this.world = this.engine.world;
    this.setWorldBounds();

    this.initBall();

    this.initWorldCollisions();
  }

  private setWorldBounds(): void {
    // Create a boundary rectangle around the world
    const bounds = {
      x: 0,
      y: 0,
      width: Game.Width,
      height: Game.Height,
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

    this.bottomWall.label = Game.Wall.BottomLabel;

    this.leftWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.leftWall, {
      x: -bounds.thickness * 0.5,
      y: bounds.height * 0.5
    });
    this.leftWall.label = Game.Wall.LeftLabel;

    this.rightWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.rightWall, {
      x: bounds.width + bounds.thickness * 0.5,
      y: bounds.height * 0.5
    });
    this.rightWall.label = Game.Wall.RightLabel;

    this.topWall = Bodies.rectangle(0, 0, bounds.thickness, bounds.thickness, bounds.options);
    Body.setPosition(this.topWall, {
      x: bounds.width * 0.5,
      y: -bounds.thickness * 0.5
    });
    this.topWall.label = Game.Wall.TopLabel;

    World.add(this.world, [this.topWall, this.bottomWall, this.leftWall, this.rightWall]);
  }

  private initWorldCollisions(): void {
    Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair: Pair = pairs[i];
        this.ball.updateAfterCollisions(pair);
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

  startGame(io: Server) {
    this.gameStarted = true;
    io.to(this.id).emit(SocketEvents.Game.Start, this.getGameState());
  }

  stopGame(io: Server): void {
    this.gameStarted = false;
    this.lastUpdateTime = 0;

    this.resetEngine();
    this.players.forEach((player) => {
      player.resetPaddle(this.world);
      player.setNotReady();
    });

    io.to(this.id).emit(SocketEvents.Game.Stopped);
  }

  isFull(): boolean {
    return this.players.length === Game.Room.MaxPlayers;
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
      console.log(`[GameRoom:tryAddPlayer] you (${playerId}) already in this room`);
      return false;
    }

    if (this.isFull()) {
      console.log(`[GameRoom:tryAddPlayer] ${this.id} is full.`);
      return false;
    }

    this.addPlayer(playerId);
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
    if (this.lastUpdateTime && deltaTime > Game.UpdateInterval) {
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
    return {
      id: this.id,
      players: Array.from(this.players.values()).map((p) => p.toJson())
    };
  }
}
