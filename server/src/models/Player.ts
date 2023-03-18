import {Paddle} from "../entities/Paddle";
import {Position} from "../entities/component/Position";
import IPlayer, {PlayerIndex} from "@shared/types/IPlayer";

export default class Player {
  id: string;
  index: PlayerIndex;
  paddle: Paddle;

  constructor(id: string, index: PlayerIndex) {
    this.id = id;
    this.index = index;
    this.paddle = new Paddle(index);
  }

  setPaddlePosition(y: number): void {
    const positionComponent = this.paddle.getComponent(Position);
    if (positionComponent) {
      positionComponent.y = y;
    }
  }

  toJson(): IPlayer {
    return {
      id: this.id,
      index: this.index,
      paddle: this.paddle.toJson()
    }
  }
}

