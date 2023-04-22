import Player, { IPlayer } from '@hell-pong/shared/gameData/Player';
import { GameConstant } from '@hell-pong/shared/constants/game';

export enum RoomPriority {
  PIN = 999,
  HIGH = 100,
  LOW = 0
}
export interface IRoomInfo {
  id: string;
  players: IPlayer[];
}
export class RoomInfo {
  id: string;
  players: Player[];
  priority: RoomPriority;

  constructor(id: string, players: Player[]) {
    this.id = id;
    this.players = players;
    this.priority = this.isFull() ? RoomPriority.LOW : RoomPriority.HIGH;
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

  public pin(): this {
    this.priority = RoomPriority.PIN;
    return this;
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

  static fromJsonList(roomInfos: IRoomInfo[], myId?: string): RoomInfo[] {
    return roomInfos.map(({ id, players }) => {
      const room = new RoomInfo(
        id,
        players.map((p) => Player.fromJson(p))
      );
      if (myId && room.hasPlayer(myId)) {
        room.pin();
      }
      return room;
    });
  }
}
