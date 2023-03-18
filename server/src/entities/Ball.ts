import {Entity} from "./Entity";
import {Position} from "./component/Position";
import {Velocity} from "./component/Velocity";
import {Size} from "./component/Size";
import {BALL_SIZE, BALL_SPEED, GAME_HEIGHT, GAME_WIDTH} from "@shared/constants";
import IPoint from "@shared/types/IPoint";
import ISize from "@shared/types/ISize";

export class Ball extends Entity {
  constructor() {
    super();

    this.addComponent<Position>(new Position(GAME_WIDTH*0.5 - BALL_SIZE*0.5, GAME_HEIGHT*0.5 - BALL_SIZE*0.5));
    this.addComponent<Size>(new Size(BALL_SIZE, BALL_SIZE));
    this.addComponent<Velocity>(new Velocity(BALL_SPEED, BALL_SPEED));
  }

  toJson(): { position: IPoint, velocity: IPoint, size: ISize } {
    return {
      position: this.getComponent<Position>(Position)!.toJson(),
      velocity: this.getComponent<Velocity>(Velocity)!.toJson(),
      size: this.getComponent<Size>(Size)!.toJson()
    }
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
}

