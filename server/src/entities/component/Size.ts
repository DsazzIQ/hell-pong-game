import ISize from "@shared/types/ISize";
import Component from "./Component";

export class Size extends Component implements ISize {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }

  toJson(): ISize {
    return {
      width: this.width,
      height: this.height
    }
  }
}