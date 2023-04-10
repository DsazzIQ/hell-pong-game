import { Bodies, Body, Pair } from 'matter-js';

import {
  BALL_LABEL,
  BALL_MAX_SPEED,
  BALL_RADIUS,
  BALL_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  PADDLE_LABEL_ONE,
  PADDLE_LABEL_TWO
} from '../constants';
import { IPosition, Position } from './component/Position';
import { IVelocity, Velocity } from './component/Velocity';
import { Entity } from './Entity';

export interface IBall {
  position: IPosition;
  velocity: IVelocity;
}

export class Ball extends Entity {
  constructor(position?: IPosition, velocity?: IVelocity) {
    super();

    const x = position ? position.x : this.initX;
    const y = position ? position.y : this.initY;

    const options = {
      frictionAir: 0,
      friction: 0,
      restitution: 1,
      label: BALL_LABEL
    };
    this.body = Bodies.circle(x, y, BALL_RADIUS, options);
    // Body.setAngularVelocity(this.body, 0);

    const velocityX = velocity ? velocity.x : BALL_SPEED;
    const velocityY = velocity ? velocity.y : BALL_SPEED;
    this.setVelocity(new Velocity(velocityX, velocityY));
  }

  limitMaxSpeed() {
    const { x, y } = this.body.velocity;
    const currentSpeed = this.body.speed;
    // Check if the ball's speed exceeds the maximum speed
    if (currentSpeed > BALL_MAX_SPEED) {
      // Calculate the scaling factor to limit the ball's speed
      const scaleFactor = BALL_MAX_SPEED / currentSpeed;
      // Set the ball's velocity to the scaled velocity
      this.setVelocity(new Velocity(x * scaleFactor, y * scaleFactor));
    } else if (currentSpeed < BALL_SPEED) {
      // Set the ball's velocity to the minimum speed
      const scaleFactor = BALL_SPEED / currentSpeed;
      this.setVelocity(new Velocity(x * scaleFactor, y * scaleFactor));
    }
  }

  updateAfterCollisions(pair: Pair): this {
    if (!this.collidesInPair(pair)) {
      return this;
    }

    if (this.collidesInPairWith(pair, PADDLE_LABEL_ONE)) {
      console.log('BALL COLLIDED WITH', PADDLE_LABEL_ONE);
      return this.invertVelocityX();
    }

    if (this.collidesInPairWith(pair, PADDLE_LABEL_TWO)) {
      console.log('BALL COLLIDED WITH', PADDLE_LABEL_TWO);
      return this.invertVelocityX();
    }

    if (this.collidingWithVerticalWalls(pair)) {
      console.log('BALL COLLIDED WITH: VERTICAL WALL');
      return this.invertVelocityY().applyRandomForce();
    }

    if (this.collidingWithHorizontalWalls(pair)) {
      console.log('BALL COLLIDED WITH: HORIZONT WALL');
      return this.invertVelocityX().applyRandomForce();
    }

    return this;
  }

  // applyRandomForce(): this {
  //   // Calculate a random angle for the force
  //   const angle = Math.random() * Math.PI * 2;
  //
  //   // Calculate the force vector based on the angle and a random magnitude
  //   const magnitude = Math.random() * 0.05;
  //   const force = { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
  //
  //   // Apply the force to the ball
  //   Body.applyForce(this.body, this.body.position, force);
  //
  //   return this;
  applyRandomForce(): this {
    const randomX = Math.random() * 0.01;
    const randomY = Math.random() * 0.01;
    const force = {
      x: randomX,
      y: randomY
    };
    Body.applyForce(this.body, this.body.position, force);
    return this;
  }

  private get initX(): number {
    return GAME_WIDTH * 0.5 - BALL_RADIUS;
  }

  private get initY(): number {
    return GAME_HEIGHT * 0.5 - BALL_RADIUS;
  }

  invertVelocityY(): this {
    return this.setVelocity(this.velocity.invertY());
  }

  invertVelocityX(): this {
    return this.setVelocity(this.velocity.invertX());
  }

  interpolatePosition(target: Position, alpha: number) {
    const interpolated = this.position.interpolate(target, alpha);
    Body.setPosition(this.body, interpolated.toJson());
    return this;
  }

  resetPosition(): this {
    const initialPosition = new Position(this.initX, this.initY);
    Body.setPosition(this.body, initialPosition.toJson());
    return this;
  }

  private setVelocity(velocity: Velocity): this {
    Body.setVelocity(this.body, velocity.toJson());
    return this;
  }

  toJson(): IBall {
    return {
      position: this.position.toJson(),
      velocity: this.velocity.toJson()
    };
  }

  static fromJson({ position, velocity }: IBall): Ball {
    return new Ball(position, velocity);
  }
}
