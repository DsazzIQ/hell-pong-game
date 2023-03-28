import Component from './Component';

export interface ISize {
  width: number;
  height: number;
}

export class Size extends Component implements ISize {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }

  get widthCenter(): number {
    return this.width * 0.5;
  }

  get heightCenter(): number {
    return this.height * 0.5;
  }

  static fromJson(json: ISize): Size {
    return new Size(json.width, json.height);
  }

  toJson(): ISize {
    return {
      width: this.width,
      height: this.height
    };
  }
}
