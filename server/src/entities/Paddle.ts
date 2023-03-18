import {Entity} from "./Entity";
import {Position} from "./component/Position";
import {Ball} from "./Ball";
import {Size} from "./component/Size";
import {PlayerIndex} from "@shared/types/IPlayer";
import {GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT, PADDLE_OFFSET, PADDLE_WIDTH} from "@shared/constants";
import IPoint from "@shared/types/IPoint";
import ISize from "@shared/types/ISize";

export class Paddle extends Entity {
  constructor(playerIndex: PlayerIndex) {
    super();
    this.addComponent<Position>(this.calculateInitialPosition(playerIndex));
    this.addComponent<Size>(new Size(PADDLE_WIDTH, PADDLE_HEIGHT));
  }

  toJson(): { position: IPoint, size: ISize } {
    return {
      position: this.getComponent<Position>(Position)!.toJson(),
      size: this.getComponent<Size>(Size)!.toJson()
    }
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

    const ballLeft = ballPosition.x;
    const ballRight = ballPosition.x + ballSize.width;
    const ballTop = ballPosition.y;
    const ballBottom = ballPosition.y + ballSize.height;

    const paddleLeft = paddlePosition.x;
    const paddleRight = paddlePosition.x + paddleSize.width;
    const paddleTop = paddlePosition.y;
    const paddleBottom = paddlePosition.y + paddleSize.height;

    const collisionX = ballRight >= paddleLeft && ballLeft <= paddleRight;
    const collisionY = ballBottom >= paddleTop && ballTop <= paddleBottom;

    return collisionX && collisionY;
  }

  private calculateInitialPosition(playerIndex: PlayerIndex): Position {
    const paddleX = playerIndex === PlayerIndex.FIRST ? PADDLE_OFFSET : GAME_WIDTH - PADDLE_WIDTH - PADDLE_OFFSET;
    const paddleY = (GAME_HEIGHT - PADDLE_HEIGHT) * 0.5;

    return new Position(paddleX, paddleY);
  }
}