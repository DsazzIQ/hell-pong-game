import { PlayerMove } from '@hell-pong/shared/gameData/Player';
import express from 'express';
import http from 'http';
import path from 'path';
import { Socket, Server as SocketIOServer } from 'socket.io';

import { ServerToClientEvents } from '../../shared/src/types/socket.io';
import GameRoomHandler from './handlers/GameRoomHandler';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { GameConstant } from '@hell-pong/shared/constants/game';
import { ClientToServerEvents } from '@hell-pong/shared/dist/types/socket.io';
import logger from './logger';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*', // or specify the allowed origins 'http://localhost:8080'
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

const roomManager = new GameRoomHandler(io);

io.on(SocketEvents.Base.Connection, (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  const playerId = socket.id;
  logger.info(`[${SocketEvents.Base.Connection}] player [${playerId}]`);

  socket.on(SocketEvents.Base.Disconnect, () => {
    logger.info(`[${SocketEvents.Base.Disconnect}] player [${playerId}]`);
    roomManager.removePlayerFromRoom(socket);
  });

  socket.on(SocketEvents.Room.Create, () => {
    roomManager.createRoom(socket);
  });

  socket.on(SocketEvents.Room.List, () => {
    roomManager.emitRoomListUpdate();
  });

  socket.on(SocketEvents.Room.Join, (roomId: string) => {
    roomManager.joinRoom(socket, roomId);
  });

  socket.on(SocketEvents.Room.PlayerReady, (roomId: string) => {
    roomManager.playerReady(socket, roomId);
  });

  socket.on(SocketEvents.Room.PlayerLeave, (roomId: string) => {
    roomManager.removePlayerFromRoom(socket, roomId);
  });

  socket.on(SocketEvents.Game.PlayerMoved, (key: PlayerMove) => {
    roomManager.onPlayerMoved(socket, key);
  });

  // ... (Other event listeners and logic)
});

// Game loop
setInterval(() => {
  roomManager.updateAndEmitState(io);
}, GameConstant.UpdateInterval);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => logger.info(`server is listening on port ${PORT}`));
