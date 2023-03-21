import {IPaddle, Paddle} from "../entities/Paddle";

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

  constructor(id: string, index: PlayerIndex) {
    this.id = id;
    this.index = index;
    this.paddle = new Paddle(index);
  }

  toJson(): IPlayer {
    return {
      id: this.id,
      index: this.index,
      paddle: this.paddle.toJson()
    }
  }
}

// const limitMaxSpeed = () => {
//   let maxSpeed = 1;
//   if (body.velocity.x > maxSpeed) {
//     Body.setVelocity(body, { x: maxSpeed, y: body.velocity.y });
//   }
//
//   if (body.velocity.x < -maxSpeed) {
//     Body.setVelocity(body, { x: -maxSpeed, y: body.velocity.y });
//   }
//
//   if (body.velocity.y > maxSpeed) {
//     Body.setVelocity(body, { x: body.velocity.x, y: maxSpeed });
//   }
//
//   if (body.velocity.y < -maxSpeed) {
//     Body.setVelocity(body, { x: -body.velocity.x, y: -maxSpeed });
//   }
// }
// Events.on(engine, 'beforeUpdate', limitMaxSpeed);

