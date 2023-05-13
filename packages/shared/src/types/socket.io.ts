import { IGameError, IGameState } from 'src/gameData/GameState';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { PlayerMove } from '@hell-pong/shared/gameData/Player';
import { IRoomInfo } from '@hell-pong/shared/gameData/RoomInfo';

export interface ServerToClientEvents {
  [SocketEvents.Room.UpdateList]: (roomInfos: IRoomInfo[]) => void;
  [SocketEvents.Game.StateUpdate]: (gameState: IGameState) => void;
  [SocketEvents.Game.ScoreUpdate]: (playerOneScore: number, playerTwoScore: number) => void;
  [SocketEvents.Game.Start]: (state: IGameState) => void;
  [SocketEvents.Game.Stopped]: () => void;
  [SocketEvents.Game.Error]: (error: IGameError) => void;
}
export interface ClientToServerEvents {
  [SocketEvents.Room.List]: () => void;
  [SocketEvents.Room.Create]: () => void;
  [SocketEvents.Room.Join]: (roomId: string) => void;
  [SocketEvents.Room.PlayerReady]: (roomId: string) => void;
  [SocketEvents.Room.PlayerLeave]: (roomId: string) => void;
  [SocketEvents.Game.PlayerMoved]: (key: PlayerMove) => void;
}
