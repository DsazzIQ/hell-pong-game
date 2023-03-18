import IPoint from "./IPoint";
import ISize from "./ISize";

export enum PlayerIndex {
  FIRST,
  SECOND
}
export default interface IPlayer {
  id: string;
  index: PlayerIndex,
  paddle: {
    position: IPoint;
    size: ISize;
  }
}
