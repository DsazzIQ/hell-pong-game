import {Entity} from "./Entity";
import {IPosition, Position} from "./component/Position";
import {Ball} from "./Ball";
import {ISize, Size} from "./component/Size";
import {GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT, PADDLE_OFFSET, PADDLE_SPEED, PADDLE_WIDTH} from "../constants";
import {PlayerIndex} from "../gameData/Player";
import {IVelocity, Velocity} from "./component/Velocity";

export interface IPaddle {
  playerIndex: PlayerIndex,
  fps: number,
  position: IPosition,
  velocity: IVelocity,
  size: ISize
}

export class Paddle extends Entity {
  playerIndex: PlayerIndex;
  fps: number;
  constructor(playerIndex: PlayerIndex, fps: number) {
    super();
    this.playerIndex = playerIndex;
    this.fps = fps;
    this.addComponent<Position>(this.calculateInitialPosition(playerIndex, fps));
    this.addComponent<Velocity>(new Velocity(0, PADDLE_SPEED));
    this.addComponent<Size>(new Size(PADDLE_WIDTH, PADDLE_HEIGHT));
  }

  move(): this {
    const position = this.getComponent<Position>(Position)!;
    const velocity = this.getComponent<Velocity>(Velocity)!;

    if (position.collidingWithTopVerticalBound(PADDLE_HEIGHT)) {
      velocity.stopY();
      position.setTopY(PADDLE_HEIGHT);
      return this;
    }

    if (position.collidingWithBottomVerticalBound(PADDLE_HEIGHT)) {
      velocity.stopY();
      position.setBottomY(PADDLE_HEIGHT);
      return this;
    }

    position.move(velocity);
    return this;
  }

  checkCollision(ball: Ball): boolean {
    const paddlePosition = this.getComponent<Position>(Position);
    const paddleSize = this.getComponent<Size>(Size);
    const ballPosition = ball.getComponent<Position>(Position);
    const ballSize = ball.getComponent<Size>(Size);

    if (!paddlePosition || !paddleSize || !ballPosition || !ballSize) {
      console.error("[Paddle:checkCollision] Paddle or ball position or size not found.");
      return false;
    }

    const ballShiftY = ballSize.height*0.5;
    const ballShiftX = ballSize.width*0.5;
    const ballLeft = ballPosition.x - ballShiftX;
    const ballRight = ballPosition.x + ballShiftX;
    const ballTop = ballPosition.y - ballShiftY;
    const ballBottom = ballPosition.y + ballShiftY;

    const paddleShiftY = paddleSize.width*0.5;
    const paddleShiftX = paddleSize.width*0.5;
    const paddleLeft = paddlePosition.x - paddleShiftX;
    const paddleRight = paddlePosition.x + paddleShiftX;
    const paddleTop = paddlePosition.y - paddleShiftY;
    const paddleBottom = paddlePosition.y + paddleShiftY;

    const collisionX = ballRight >= paddleLeft && ballLeft <= paddleRight;
    const collisionY = ballBottom >= paddleTop && ballTop <= paddleBottom;

    return collisionX && collisionY;
  }

  private calculateInitialPosition(playerIndex: PlayerIndex, fps: number): Position {
    let paddleX;
    switch (playerIndex) {
      case PlayerIndex.FIRST: paddleX = PADDLE_OFFSET + PADDLE_WIDTH; break;
      case PlayerIndex.SECOND: paddleX = GAME_WIDTH - PADDLE_WIDTH - PADDLE_OFFSET; break;
      case PlayerIndex.UNKNOWN: paddleX = 0; break;
      default: paddleX = 0;
    }

    const paddleY = (GAME_HEIGHT - PADDLE_HEIGHT) * 0.5;

    return new Position(paddleX, paddleY, fps);
  }

  fromJson(json: IPaddle): Paddle {
    const paddle = new Paddle(json.playerIndex, json.position.fps);
    paddle.addComponent<Position>(new Position(json.position.x, json.position.y, json.position.fps));
    paddle.addComponent<Size>(new Size(json.size.width, json.size.height));

    return paddle;
  }

  toJson(): IPaddle {
    return {
      playerIndex: this.playerIndex,
      fps: this.fps,
      position: this.getComponent<Position>(Position)!.toJson(),
      velocity: this.getComponent<Velocity>(Velocity)!.toJson(),
      size: this.getComponent<Size>(Size)!.toJson()
    }
  }
}