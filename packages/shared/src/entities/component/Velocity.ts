import Component from './Component';
import { GameConstant } from '@hell-pong/shared/constants/game';

export interface IVelocity {
  x: number;
  y: number;
}
export class Velocity extends Component implements IVelocity {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  invertX(): this {
    this.x = -Math.abs(this.x);
    return this;
  }

  invertY(): this {
    this.y = -Math.abs(this.y);
    return this;
  }

  interpolateY(target: Velocity, speed: number) {
    const newY = ((target.y - this.y) / GameConstant.UpdateInterval) * speed;
    return new Velocity(target.x, newY);
  }
  // interpolate(target: Position, alpha: number): Position {
  //   const deltaX = target.x - this.x;
  //   const deltaY = target.y - this.y;
  //   const interpolatedX = this.x + deltaX * alpha;
  //   const interpolatedY = this.y + deltaY * alpha;
  //   return new Position(interpolatedX, interpolatedY);
  // }

  stopY(): this {
    this.y = 0;
    return this;
  }

  static fromJson(json: IVelocity): Velocity {
    return new Velocity(json.x, json.y);
  }

  toJson(): IVelocity {
    return {
      x: this.x,
      y: this.y
    };
  }
}
