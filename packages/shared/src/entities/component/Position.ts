import Component from './Component';

export interface IPosition {
  x: number;
  y: number;
}

export class Position extends Component implements IPosition {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  interpolate(target: Position, alpha: number): Position {
    const deltaX = target.x - this.x;
    const deltaY = target.y - this.y;
    const interpolatedX = this.x + deltaX * alpha;
    const interpolatedY = this.y + deltaY * alpha;
    return new Position(interpolatedX, interpolatedY);
  }

  interpolateXY(targetX: number, targetY: number, alpha: number): Position {
    return this.interpolate(new Position(targetX, targetY), alpha);
  }

  static fromJson({ x, y }: IPosition): Position {
    return new Position(x, y);
  }

  toJson(): IPosition {
    return {
      x: this.x,
      y: this.y
    };
  }
}
