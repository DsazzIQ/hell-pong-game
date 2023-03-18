import IPoint from "./IPoint";
import IPlayer from "./IPlayer";

export default interface IGameState {
  roomId: string;
  ball: {
    position: IPoint;
    velocity: IPoint;
  };
  players: IPlayer[];
}

