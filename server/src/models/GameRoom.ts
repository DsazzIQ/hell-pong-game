import {Ball} from "../entities/Ball";
import Player from "./Player";
import {Server} from "socket.io";
import {MAX_ROOM_PLAYERS} from "@shared/constants";
import IPoint from "@shared/types/IPoint";
import IPlayer, {PlayerIndex} from "@shared/types/IPlayer";
import IRoomInfo from "@shared/types/IRoomInfo";

export class GameState {
  roomId: string;

  ball: {
    position: IPoint;
    velocity: IPoint;
  };
  players: IPlayer[];

  constructor(roomId: string, ball: Ball, players: Player[]) {
    this.roomId = roomId;
    this.ball = ball.toJson();
    this.players = players.map((player) => player.toJson());
  }
}

export default class GameRoom {
  readonly id: string;
  private players: Player[] = [];
  private readonly ball: Ball;

  private gameStarted = false;

  constructor(roomId: string) {
    this.id = roomId;
    this.ball = new Ball();
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
    const player = new Player(id, playerIndex);
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

  update(): this {
    this.ball
      .move() // Update ball position
      .updateAfterWallCollisions(); // Check for collisions with walls

    // Check for collisions with paddles
    for (const player of this.players) {
      if (player.paddle.checkCollision(this.ball)) {
        this.ball.invertVelocityX();
      }
    }

    return this;
  }

  getGameState(): GameState {
    return new GameState(this.id, this.ball, this.players);
  }

  toJSON(): IRoomInfo {
    return {
      id: this.id,
      players: Array.from(this.players.values()),
    };
  }
}
