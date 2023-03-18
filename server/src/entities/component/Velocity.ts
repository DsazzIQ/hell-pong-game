import IPoint from "@shared/types/IPoint";
import Component from "./Component";

export class Velocity extends Component implements IPoint {
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

  toJson(): IPoint {
    return {
      x: this.x,
      y: this.y
    }
  }
}