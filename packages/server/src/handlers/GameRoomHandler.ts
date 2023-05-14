import { PlayerMove } from '@hell-pong/shared/gameData/Player';
import { ClientToServerEvents, ServerToClientEvents } from '@hell-pong/shared/types/socket.io';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';

import GameRoom from '../gameLogic/GameRoom';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import logger from '../logger';
import { IRoomInfo } from '@hell-pong/shared/gameData/RoomInfo';

export default class GameRoomHandler {
  private readonly rooms: Map<string, GameRoom>;

  constructor(private io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.rooms = new Map<string, GameRoom>();
  }

  private generateUniqueRoomId(): string {
    let roomId = '';

    do {
      roomId = uuid(); // Generate a unique ID
    } while (this.rooms.has(roomId)); // Continue generating new IDs until a unique one is found

    return roomId;
  }

  createRoom(socket: Socket): GameRoom {
    const roomId = this.generateUniqueRoomId();
    const room = new GameRoom(roomId, this.io);
    this.rooms.set(roomId, room);
    logger.info(`created room [${roomId}]`);

    room.tryAddPlayer(socket.id);

    socket.join(roomId);
    this.emitRoomListUpdate(); // Emit the updated room list

    return room;
  }

  playerReady(socket: Socket, roomId: string): void {
    const room = this.getRoom(roomId);
    if (!room) {
      const message = `room [${roomId}] not found`;
      logger.error(message);
      socket.emit(SocketEvents.Game.Error, {
        roomId,
        message
      });
      return;
    }

    const playerId = socket.id;
    const player = room.findPlayer(playerId);
    if (!player) {
      const message = `player [${playerId}] not in the room [${roomId}]`;
      logger.error(message);
      socket.emit(SocketEvents.Game.Error, {
        roomId,
        message
      });
      return;
    }

    logger.info(`player [${playerId}] ready for game in the room [${roomId}]`);
    player.imReady();
    this.emitRoomListUpdate();

    if (room.arePlayersReady()) {
      room.startGame(this.io);
    }
  }

  joinRoom(socket: Socket, roomId: string): GameRoom | null {
    const room = this.getRoom(roomId);
    if (!room) {
      const message = `room [${roomId}] not found.`;
      logger.error(message);
      socket.emit(SocketEvents.Game.Error, {
        roomId,
        message
      });

      return null;
    }

    const playerId = socket.id;
    if (!room.tryAddPlayer(playerId)) {
      const message = `player [${playerId}] can not join room [${roomId}]`;
      socket.emit(SocketEvents.Game.Error, {
        roomId,
        message
      });

      return null;
    }

    socket.join(roomId);
    logger.info(`player [${playerId}] joined room [${roomId}]`);
    this.emitRoomListUpdate();

    return room;
  }

  getRoomList(): IRoomInfo[] {
    return Array.from(this.rooms, ([_, room]) => room.toJson());
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  removeRoom(roomId: string): boolean {
    this.rooms.delete(roomId);
    logger.info(`room [${roomId}] has been removed`);

    this.emitRoomListUpdate();
    return true;
  }

  /**
   * Find a room containing the specified player ID
   * @param playerId The ID of the player to search for
   * @returns The room containing the player or undefined if not found
   */
  findRoomByPlayerId(playerId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.hasPlayer(playerId)) {
        return room;
      }
    }
    return undefined;
  }

  removePlayerFromRoom(socket: Socket, roomId?: string): boolean {
    const playerId = socket.id;
    const room = roomId ? this.getRoom(roomId) : this.findRoomByPlayerId(playerId);
    if (!room) {
      logger.info(`not found player's room for player [${playerId}]`);
      return false;
    }

    if (room.hasPlayer(playerId)) {
      if (room.removePlayer(playerId)) {
        logger.info(`player [${playerId}] has left the room [${room.id}]`);
      }

      if (room.isEmpty()) {
        logger.info(`room [${room.id}] is empty`);
        this.removeRoom(room.id);
      } else if (room.isGameStarted()) {
        logger.info(`stopping the game for room [${room.id}]`);
        room.stopGame(this.io);
      }
    }

    this.emitRoomListUpdate();

    return true;
  }

  onPlayerMoved(socket: Socket, key: PlayerMove): boolean {
    const playerId = socket.id;
    const room = this.findRoomByPlayerId(playerId);
    if (!room) {
      logger.error(`room for player [${playerId}] not found!`);
      return false;
    }

    const player = room.findPlayer(playerId);
    if (!player) {
      logger.error(`not found player [${playerId}] in room ${room.id}!`);
      return false;
    }

    player.paddle.move(key);

    return true;
  }

  updateAndEmitState(io: Server) {
    this.rooms.forEach((room) => {
      if (room.isGameStarted()) {
        const state = room.update().getGameState();
        io.to(room.id).emit(SocketEvents.Game.StateUpdate, state);
      }
      if (room.isGameOver()) {
        this.removeRoom(room.id);
      }
    });
  }

  emitRoomListUpdate() {
    this.io.emit(SocketEvents.Room.UpdateList, this.getRoomList());
  }
}
