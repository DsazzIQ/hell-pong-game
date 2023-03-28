import { Bodies, Body, Vector } from 'matter-js';

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_LABEL_ONE,
  PADDLE_LABEL_TWO,
  PADDLE_OFFSET,
  PADDLE_SPEED,
  PADDLE_WIDTH
} from '../constants';
import { PlayerIndex, PlayerMove } from '../gameData/Player';
import { IPosition, Position } from './component/Position';
import { ISize, Size } from './component/Size';
import { IVelocity, Velocity } from './component/Velocity';
import { Entity } from './Entity';

export interface IPaddle {
  playerIndex: PlayerIndex;
  position: IPosition;
  velocity: IVelocity;
  size: ISize;
}

export class Paddle extends Entity {
  playerIndex: PlayerIndex;
  private readonly speed: number = PADDLE_SPEED;

  constructor(playerIndex: PlayerIndex, position?: IPosition, velocity?: IVelocity, size?: ISize) {
    super();
    this.playerIndex = playerIndex;

    const initialPosition = this.calculateInitialPosition(playerIndex);
    const x = position ? position.x : initialPosition.x;
    const y = position ? position.y : initialPosition.y;

    const initialSize = new Size(PADDLE_WIDTH, PADDLE_HEIGHT);
    const width = size ? size.width : initialSize.width;
    const height = size ? size.height : initialSize.height;

    console.log('CREATE PADDLE');
    const options = {
      friction: 0,
      frictionAir: 0,
      restitution: 0,
      inertia: Number.MAX_SAFE_INTEGER,
      mass: Number.MAX_SAFE_INTEGER,
      label: playerIndex === PlayerIndex.FIRST ? PADDLE_LABEL_ONE : PADDLE_LABEL_TWO
    };
    this.body = Bodies.rectangle(x, y, width, height, options);

    const velocityX = velocity ? velocity.x : 0;
    const velocityY = velocity ? velocity.y : 0;
    this.setVelocity(new Velocity(velocityX, velocityY));
  }

  preventMoving() {
    this.body.position.x = Paddle.getInitialPositionX(this.playerIndex);
    this.body.velocity.y = 0;
  }

  // checkCollision(ball: Ball): boolean {
  //   return Collision.create(ball.getBody(), this.body).collided;
  // }

  moveUp(): this {
    return this.setVelocity(new Velocity(0, -this.speed));
  }

  moveDown(): this {
    return this.setVelocity(new Velocity(0, this.speed));
  }

  stop() {
    return this.setVelocity(new Velocity(0, 0));
  }

  move(key: PlayerMove): this {
    switch (key) {
      case PlayerMove.UP:
        return this.moveUp();
      case PlayerMove.DOWN:
        return this.moveDown();
      case PlayerMove.STOP:
        return this.stop();
    }
  }

  private setVelocity(velocity: Velocity): this {
    Body.setVelocity(this.body, Vector.create(velocity.x, velocity.y));
    return this;
  }

  static getInitialPositionX(playerIndex: PlayerIndex): number {
    let paddleX;
    switch (playerIndex) {
      case PlayerIndex.FIRST:
        paddleX = PADDLE_OFFSET + PADDLE_WIDTH;
        break;
      case PlayerIndex.SECOND:
        paddleX = GAME_WIDTH - PADDLE_WIDTH - PADDLE_OFFSET;
        break;
      case PlayerIndex.UNKNOWN:
        paddleX = 0;
        break;
      default:
        paddleX = 0;
    }
    return paddleX;
  }

  private calculateInitialPosition(playerIndex: PlayerIndex): Position {
    const paddleX = Paddle.getInitialPositionX(playerIndex);
    const paddleY = (GAME_HEIGHT - PADDLE_HEIGHT) * 0.5;

    return new Position(paddleX, paddleY);
  }

  fromJson({ playerIndex, position, velocity, size }: IPaddle): Paddle {
    return new Paddle(playerIndex, position, velocity, size);
  }

  toJson(): IPaddle {
    return {
      playerIndex: this.playerIndex,
      position: this.position.toJson(),
      velocity: this.velocity.toJson(),
      size: this.size.toJson()
    };
  }
}
