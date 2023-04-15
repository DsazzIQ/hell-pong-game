import { PlayerMove } from '@hell-pong/shared/gameData/Player';
import express from 'express';
import http from 'http';
import path from 'path';
import { Socket, Server as SocketIOServer } from 'socket.io';

import { ServerToClientEvents } from '../../shared/src/types/socket.io';
import GameRoomHandler from './handlers/GameRoomHandler';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { Game } from '@hell-pong/shared/constants/game';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer<ServerToClientEvents>(server, {
  cors: {
    origin: '*', // or specify the allowed origins 'http://localhost:8080'
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const roomManager = new GameRoomHandler(io);

io.on(SocketEvents.Base.Connection, (socket: Socket) => {
  const playerId = socket.id;
  console.log(`[Server:${SocketEvents.Base.Connection}] player ID`, playerId);

  socket.on(SocketEvents.Base.Disconnect, () => {
    console.log(`[Server:${SocketEvents.Base.Disconnect}] player ID ${playerId}`);
    roomManager.removePlayerFromRoom(socket);
  });

  socket.on(SocketEvents.Room.Create, () => {
    roomManager.createRoom(socket);
  });

  socket.on(SocketEvents.Room.List, () => {
    roomManager.emitRoomListUpdate();
  });

  socket.on(SocketEvents.Room.Join, (data: { roomId: string }) => {
    const roomId = data.roomId;
    roomManager.joinRoom(socket, roomId);
  });

  socket.on(SocketEvents.Room.PlayerReady, (data: { roomId: string }) => {
    roomManager.playerReady(socket, data.roomId);
  });

  socket.on(SocketEvents.Game.PlayerMoved, (data: { key: PlayerMove }) => {
    roomManager.onPlayerMoved(socket, data.key);
  });

  // ... (Other event listeners and logic)
});

// Game loop
setInterval(() => {
  roomManager.updateAndEmitState(io);
}, Game.UpdateInterval);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
