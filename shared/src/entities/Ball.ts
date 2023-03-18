import {Entity} from "./Entity";
import {IPosition, Position} from "./component/Position";
import {IVelocity, Velocity} from "./component/Velocity";
import {ISize, Size} from "./component/Size";
import {BALL_SIZE, BALL_SPEED, GAME_HEIGHT, GAME_WIDTH} from "../constants";

export interface IBall {
  position: IPosition;
  size: ISize;
  velocity: IVelocity;
}

export class Ball extends Entity {
  constructor(fps: number) {
    super();

    this.addComponent<Position>(new Position(GAME_WIDTH*0.5 - BALL_SIZE*0.5, GAME_HEIGHT*0.5 - BALL_SIZE*0.5, fps));
    this.addComponent<Size>(new Size(BALL_SIZE, BALL_SIZE));
    this.addComponent<Velocity>(new Velocity(BALL_SPEED, BALL_SPEED));
  }

  updateAfterWallCollisions(): this {
    const ballPosition = this.getComponent<Position>(Position)!;
    const ballSize = this.getComponent<Size>(Size)!;

    if (ballPosition.collidingWithVerticalBounds(ballSize.width, GAME_HEIGHT)) {
      this.invertVelocityY();
    }
    if (ballPosition.collidingWithHorizontalBounds(ballSize.width, GAME_WIDTH)) {
      this.invertVelocityX();
    }

    return this;
  }

  move(): this {
    const ballPosition = this.getComponent<Position>(Position)!;
    const ballVelocity = this.getComponent<Velocity>(Velocity)!;

    ballPosition.move(ballVelocity);
    return this;
  }

  invertVelocityY(): this {
    this.getComponent<Velocity>(Velocity)!.invertY();
    return this;
  }

  invertVelocityX(): this {
    this.getComponent(Velocity)!.invertX();
    return this;
  }

  interpolatePositionXY(targetX: number, targetY: number, fps: number, alpha: number) {
    return this.interpolatePosition(new Position(targetX, targetY, fps), alpha);
  }

  interpolatePosition(target: Position, alpha: number) {
    this.getComponent<Position>(Position)!.interpolate(target, alpha);
    return this;
  }

  static fromJson(json: IBall): Ball {
    const ball = new Ball(json.position.fps);
    ball.addComponent<Position>(new Position(json.position.x, json.position.y, json.position.fps));
    ball.addComponent<Size>(new Size(json.size.width, json.size.height));
    ball.addComponent<Velocity>(new Velocity(json.velocity.x, json.velocity.y));

    return ball;
  }

  toJson(): IBall {
    return {
      position: this.getComponent<Position>(Position)!.toJson(),
      velocity: this.getComponent<Velocity>(Velocity)!.toJson(),
      size: this.getComponent<Size>(Size)!.toJson()
    }
  }
}

