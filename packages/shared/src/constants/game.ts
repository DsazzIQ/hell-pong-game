export const Ball = Object.freeze({
  Size: 28,
  MaxSpeed: 7,
  Speed: 3,
  Label: 'ball',
  get Radius() {
    return this.Size * 0.5;
  }
});

export const Paddle = Object.freeze({
  Speed: 10,
  Width: 18,
  Height: 62,
  Offset: 30,
  Label: Object.freeze({
    One: 'paddle-1',
    Two: 'paddle-2'
  })
});

export const Wall = Object.freeze({
  TopLabel: 'top-wall',
  BottomLabel: 'bottom-wall',
  LeftLabel: 'left-wall',
  RightLabel: 'right-wall'
});

export const Room = Object.freeze({
  MaxPlayers: 2
});

export const Game = Object.freeze({
  Width: 800,
  get WidthCenter() {
    return this.Width * 0.5;
  },
  Height: 600,
  get HeightCenter() {
    return this.Height * 0.5;
  },
  FPS: 50,
  Ball,
  Paddle,
  Wall,
  Room,
  get UpdateInterval() {
    return 1000 / this.FPS;
  }
});
