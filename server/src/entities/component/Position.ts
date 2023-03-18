import {Velocity} from "./Velocity";
import Component from "./Component";
import IPoint from "@shared/types/IPoint";
import {GAME_FPS} from "@shared/constants";

export class Position extends Component implements IPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  collidingWithVerticalBounds(ballSize: number, gameHeight: number): boolean {
    return this.y <= 0 || this.y + ballSize >= gameHeight;
  }

  collidingWithHorizontalBounds(ballSize: number, gameWidth: number): boolean {
    return this.x <= 0 || this.x + ballSize >= gameWidth;
  }

  move(velocity: Velocity): this {
    this.x += velocity.x / GAME_FPS;
    this.y += velocity.y / GAME_FPS;
    return this;
  }

  toJson(): IPoint {
    return {
      x: this.x,
      y: this.y
    }
  }
}

