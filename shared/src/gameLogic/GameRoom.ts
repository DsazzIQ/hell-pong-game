import {Server} from "socket.io";
import Player, {PlayerIndex} from "../gameData/Player";
import {Ball} from "../entities/Ball";
import {MAX_ROOM_PLAYERS, SERVER_FPS, SERVER_UPDATE_INTERVAL} from "../constants";
import GameState, {IGameState} from "../gameData/GameState";

export interface IPlayerInfo {
  id: string;
}

export interface IRoomInfo {
  id: string;
  players: Array<IPlayerInfo>;
}

export default class GameRoom {
  readonly id: string;
  private players: Player[] = [];
  private readonly ball: Ball;

  private lastUpdateTime: number = 0;
  private gameStarted = false;

  constructor(roomId: string) {
    this.id = roomId;
    this.ball = new Ball(SERVER_FPS);
  }

  isGameStarted() {
    return this.gameStarted;
  }

  startGame(io: Server) {
    this.gameStarted = true;
    io.to(this.id).emit('startGame', this.getGameState());
  }

  isFull(): boolean {
    return this.players.length >= MAX_ROOM_PLAYERS;
  }

  isEmpty(): boolean {
    return this.players.length == 0;
  }

  private addPlayer(id: string): Player {
    const playerIndex = this.players.length ? PlayerIndex.FIRST : PlayerIndex.SECOND;
    const player = new Player(id, playerIndex, SERVER_FPS);
    this.players.push(player);

    return player;
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some(player => player.id === playerId);
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
    if (this.calculateInterpolationDelta() > SERVER_UPDATE_INTERVAL) {
      this.ball
        .move() // Update ball position
        .updateAfterWallCollisions(); // Check for collisions with walls

      // Check for collisions with paddles
      for (const player of this.players) {
        if (player.paddle.checkCollision(this.ball)) {
          this.ball.invertVelocityX()
            .move();
        }
      }

      this.updateLastUpdateTime();
    }

    return this;
  }

  getGameState(): IGameState {
    return new GameState(this.id, this.ball, this.players, this.lastUpdateTime);
  }

  toJSON(): IRoomInfo {
    return {
      id: this.id,
      players: Array.from(this.players.values()),
    };
  }
}
