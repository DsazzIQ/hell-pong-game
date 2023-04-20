import Player, { IPlayer } from '@hell-pong/shared/gameData/Player';
import { GameConstant } from '@hell-pong/shared/constants/game';

export interface IRoomInfo {
  id: string;
  players: IPlayer[];
}
export class RoomInfo {
  id: string;
  players: Player[];

  constructor(id: string, players: Player[]) {
    this.id = id;
    this.players = players;
  }

  get shortId(): string {
    return this.id.slice(0, 15);
  }

  get playersLength(): number {
    return this.players.length;
  }

  isEqual(roomId?: string): boolean {
    return this.id === roomId;
  }

  isFull(): boolean {
    return this.players.length === GameConstant.Room.MaxPlayers;
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some((player) => player.id === playerId);
  }

  findPlayer(playerId: string): Player | null {
    return this.players.find((player) => player.id === playerId) || null;
  }

  toJson(): IRoomInfo {
    return {
      id: this.id,
      players: Array.from(this.players.values()).map((p) => p.toJson())
    };
  }

  static fromJson({ id, players }: IRoomInfo): RoomInfo {
    return new RoomInfo(
      id,
      players.map((p) => Player.fromJson(p))
    );
  }

  static fromJsonList(roomInfos: IRoomInfo[]): RoomInfo[] {
    return roomInfos.map(
      ({ id, players }) =>
        new RoomInfo(
          id,
          players.map((p) => Player.fromJson(p))
        )
    );
  }
}
