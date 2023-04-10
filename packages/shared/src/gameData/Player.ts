import { IPaddle, Paddle } from '../entities/Paddle';
import { World } from 'matter-js';

export enum PlayerMove {
  UP = 'UP',
  DOWN = 'DOWN',
  STOP = 'STOP'
}
export enum PlayerIndex {
  FIRST = 0,
  SECOND = 1,
  UNKNOWN = -1
}
export enum PlayerReadyState {
  READY = 'READY',
  NOT_READY = 'NOT_READY'
}
export interface IPlayer {
  id: string;
  index: PlayerIndex;
  paddle: IPaddle;
  readyState: PlayerReadyState;
}
export default class Player implements IPlayer {
  id: string;
  index: PlayerIndex;
  readyState: PlayerReadyState;
  paddle: Paddle;

  constructor(id: string, index: PlayerIndex) {
    this.id = id;
    this.index = index;
    this.readyState = PlayerReadyState.NOT_READY;
    this.paddle = new Paddle(index);
  }

  imReady(): this {
    this.readyState = PlayerReadyState.READY;
    return this;
  }

  isReady(): boolean {
    return this.readyState === PlayerReadyState.READY;
  }

  setNotReady(): this {
    this.readyState = PlayerReadyState.NOT_READY;
    return this;
  }

  isNotReady(): boolean {
    return this.readyState === PlayerReadyState.NOT_READY;
  }

  resetPaddle(world: World): this {
    this.paddle.removeFromWorld(world);
    this.paddle = new Paddle(this.index);
    this.paddle.addToWorld(world);
    return this;
  }

  toJson(): IPlayer {
    return {
      id: this.id,
      index: this.index,
      readyState: this.readyState,
      paddle: this.paddle.toJson()
    };
  }

  static fromJson(json: IPlayer): Player {
    const player = new Player(json.id, json.index);
    player.readyState = json.readyState;
    player.paddle = Paddle.fromJson(json.paddle);
    return player;
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
