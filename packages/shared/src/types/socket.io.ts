import { IRoomInfo } from 'src/gameData/GameState';

export interface ServerToClientEvents {
  roomListUpdate: (roomInfos: IRoomInfo[]) => void;
}
export interface ClientToServerEvents {
  hello: () => void;
}
