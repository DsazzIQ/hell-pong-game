import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import GameRoom from "../gameLogic/GameRoom";
import {IRoomInfo} from "shared/gameData/GameState";

export default class GameRoomHandler {
  private readonly rooms: Map<string, GameRoom>;

  constructor(private io: Server) {
    this.rooms = new Map<string, GameRoom>();
  }

  private generateUniqueRoomId(): string {
    let roomId = '';

    do {
      roomId = uuid(); // Generate a unique ID using uuid
    } while (this.rooms.has(roomId)); // Continue generating new IDs until a unique one is found

    return roomId;
  }

  createRoom(socket: Socket): GameRoom {
    console.log(`[GameRoomHandler:createRoom]`);

    const roomId = this.generateUniqueRoomId();
    const room = new GameRoom(roomId);
    this.rooms.set(roomId, room);

    room.tryAddPlayer(socket.id);

    socket.join(roomId);
    console.log(`    Room ${roomId} created and player ${socket.id} joined.`);
    this.emitRoomListUpdate(); // Emit the updated room list

    return room;
  }

  joinRoom(socket: Socket, roomId: string): GameRoom | null {
    console.log(`[GameRoomHandler:joinRoom]`);
    const room = this.getRoom(roomId);

    if (!room) {
      console.log(`    Room ${roomId} not found.`);
      socket.emit('joinFailed', { roomId, message: `Room ${roomId} not found.` });

      return null;
    }

    if (!room.tryAddPlayer(socket.id)) {
      console.log(`    You can not join room ${roomId}`);
      socket.emit('joinFailed', { roomId, message: `You can not join room ${roomId}` });

      return null;
    }

    socket.join(roomId);
    console.log(`    Player ${socket.id} joined room ${roomId}.`);
    socket.emit('joinedRoom', room.toJson());
    room.startGame(this.io);

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
    this.emitRoomListUpdate(); // Emit the updated room list
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

  removePlayerFromRoom(socket: Socket): boolean {
    console.log(`[GameRoomHandler:removePlayerFromRoom]`);

    const playerId = socket.id;
    const room = this.findRoomByPlayerId(playerId);
    if (!room) {
      console.log(`   Not found player's room`);
      return false;
    }

    if (room.hasPlayer(playerId)) {
      if (room.removePlayer(playerId)) {
        console.log(`   Player ${playerId} has left the room ${room.id}`);
      }

      // Remove the room if it's empty
      if (room.isEmpty()) {
        console.log(`   Room with ID ${room.id} is empty, removing the room`);
        this.removeRoom(room.id);
      }
    }

    return true;
  }

  // onPlayerMoved(socket: Socket, newY: number): boolean {
  onPlayerMoved(socket: Socket, key: 'UP' | 'DOWN' | 'STOP'): boolean {
    const playerId = socket.id;
    const room = this.findRoomByPlayerId(socket.id);
    if (!room) {
      console.log(`[Server:playerMoved] room for player ${playerId} not found!`);
      return false;
    }

    const player = room.findPlayer(playerId);
    if (!player) {
      console.log(`[Server:playerMoved] player ${playerId} in room ${room.id} not found!`);
      return false;
    }

    // player.paddle.interpolateVelocity(newVelocityY);
    player.paddle.move(key);

    return true;
  }

  updateAndEmitState(io: Server) {
    this.rooms.forEach((room) => {
      if (room.isGameStarted()) {
        const state = room.update().getGameState();
        io.to(room.id).emit('gameStateUpdate', state);
      }
    });
  }

  emitRoomListUpdate() {
    this.io.emit('roomListUpdate', this.getRoomList());
  }
}