import {IPaddle, Paddle} from "../entities/Paddle";
import {Position} from "../entities/component/Position";
import {Velocity} from "../entities/component/Velocity";

export enum PlayerIndex {
  FIRST = 0,
  SECOND = 1,
  UNKNOWN = -1,
}
export interface IPlayer {
  id: string;
  index: PlayerIndex;
  paddle: IPaddle;
}
export default class Player {
  id: string;
  index: PlayerIndex;
  paddle: Paddle;

  constructor(id: string, index: PlayerIndex, fps: number) {
    this.id = id;
    this.index = index;
    this.paddle = new Paddle(index, fps);
  }

  movePaddle(): this {
    this.paddle.move();
    return this;
  }

  setPaddlePosition(y: number): this {
    const position = this.paddle.getComponent(Position);
    if (position) {
      position.y = y;
    }
    return this;
  }

  setPaddleVelocity(y: number): this {
    const velocity = this.paddle.getComponent(Velocity);
    if (velocity) {
      velocity.y = y;
    }
    return this;
  }

  toJson(): IPlayer {
    return {
      id: this.id,
      index: this.index,
      paddle: this.paddle.toJson()
    }
  }
}

