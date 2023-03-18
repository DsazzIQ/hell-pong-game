import {Velocity} from "./Velocity";
import Component from "./Component";

export interface IPosition {
  x: number;
  y: number;
  fps: number;
}
export class Position extends Component implements IPosition {
  x: number;
  y: number;
  fps: number;

  constructor(x: number, y: number, fps: number) {
    super();
    this.x = x;
    this.y = y;
    this.fps = fps;
  }

  collidingWithVerticalBounds(ballSize: number, gameHeight: number): boolean {
    return this.y <= 0 || this.y + ballSize >= gameHeight;
  }

  collidingWithHorizontalBounds(ballSize: number, gameWidth: number): boolean {
    return this.x <= 0 || this.x + ballSize >= gameWidth;
  }

  move(velocity: Velocity): this {
    this.x += velocity.x / this.fps;
    this.y += velocity.y / this.fps;
    return this;
  }

  /**
   * The interpolate method calculates a new Position instance
   * between the current position and the target position, based on the given interpolation factor alpha.
   * When alpha is 0, the result will be the current position,
   * and when alpha is 1, the result will be the target position.
   * For values between 0 and 1, the result will be a position that lies proportionally between the current and target positions.
   *
   * @param target
   * @param alpha
   */
  interpolate(target: Position, alpha: number): Position {
    const newX = this.x + alpha * (target.x - this.x);
    const newY = this.y + alpha * (target.y - this.y);
    return new Position(newX, newY, this.fps);
  }

  interpolateXY(targetX: number, targetY: number, alpha: number): Position {
    return this.interpolate(new Position(targetX, targetY, this.fps), alpha);
  }

  static fromJson(json: IPosition): Position {
    return new Position(json.x, json.y, json.fps);
  }

  toJson(): IPosition {
    return {
      x: this.x,
      y: this.y,
      fps: this.fps
    }
  }
}

