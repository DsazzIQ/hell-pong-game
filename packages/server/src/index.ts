import http from 'http';
import express from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import GameRoomHandler from './handlers/GameRoomHandler';
import path from "path";
import {GAME_UPDATE_INTERVAL} from "shared/constants";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // or specify the allowed origins 'http://localhost:8080'
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const roomManager = new GameRoomHandler(io);

io.on('connection', (socket: Socket) => {
  const playerId = socket.id;
  console.log('[Server:connection]', playerId);

  socket.on('disconnect', () => {
    console.log(`[Server:disconnect] Player with ID ${playerId} disconnected`);
    roomManager.removePlayerFromRoom(socket);
  });

  socket.on('createRoom', () => {
    roomManager.createRoom(socket);
  });

  socket.on('getRooms', () => {
    roomManager.emitRoomListUpdate();
  });

  socket.on('joinRoom', (data: { roomId: string }) => {
    const roomId = data.roomId;
    roomManager.joinRoom(socket, roomId);
  });

  // socket.on('playerMoved', (data: { y: number }) => {
  //   roomManager.onPlayerMoved(socket, data.y);
  // });
  socket.on('playerMoved', (data: { key: 'UP' | 'DOWN' | 'STOP' }) => {
    roomManager.onPlayerMoved(socket, data.key);
  });

  // ... (Other event listeners and logic)
});

// Game loop
setInterval(() => {
  roomManager.updateAndEmitState(io);
}, GAME_UPDATE_INTERVAL);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));