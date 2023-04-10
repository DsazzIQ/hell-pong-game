import { Ball, IBall } from '../entities/Ball';
import Player, { IPlayer } from './Player';

export interface IRoomInfo {
  id: string;
  players: Array<IPlayer>;
}

export interface IGameState {
  roomId: string;
  ball: IBall;
  players: IPlayer[];
  lastUpdateTime: number;
}

export default class GameState implements IGameState {
  roomId: string;
  ball: IBall;
  players: IPlayer[];
  lastUpdateTime: number;

  constructor(roomId: string, ball: Ball, players: Player[], lastUpdateTime: number) {
    this.roomId = roomId;
    this.ball = ball.toJson();
    this.players = players.map((player) => player.toJson());
    this.lastUpdateTime = lastUpdateTime;
  }
}
