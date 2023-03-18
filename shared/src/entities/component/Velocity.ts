import Component from "./Component";

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

  invertX(): void {
    this.x = -this.x;
  }

  invertY(): void {
    this.y = -this.y;
  }

  static fromJson(json: IVelocity): Velocity {
    return new Velocity(json.x, json.y);
  }

  toJson(): IVelocity {
    return {
      x: this.x,
      y: this.y
    }
  }
}