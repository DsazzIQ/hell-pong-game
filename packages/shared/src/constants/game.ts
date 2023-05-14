const BALL_SIZE = 28;
export const Ball = Object.freeze({
  Size: BALL_SIZE,
  Radius: BALL_SIZE * 0.5,
  MaxSpeed: 8,
  Speed: 4,
  Label: 'ball'
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

const FPS = 60;
const WIDTH = 800;
const HEIGHT = 600;
export const GameConstant = Object.freeze({
  Width: WIDTH,
  WidthCenter: WIDTH * 0.5,
  Height: HEIGHT,
  HeightCenter: HEIGHT * 0.5,
  FPS: FPS,
  UpdateInterval: 1000 / FPS,
  Ball,
  Paddle,
  Wall,
  Room
});
