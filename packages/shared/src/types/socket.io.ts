import { IRoomInfo } from 'src/gameData/GameState';
import { SocketEvents } from '@hell-pong/shared/constants/socket';

export interface ServerToClientEvents {
  [SocketEvents.Room.UpdateList]: (roomInfos: IRoomInfo[]) => void;
  //TODO: add all types
}
export interface ClientToServerEvents {
  //TODO: add all types
}
