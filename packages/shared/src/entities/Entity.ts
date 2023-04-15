import { Body, Pair, World } from 'matter-js';

import { Position } from './component/Position';
import { Size } from './component/Size';
import { Velocity } from './component/Velocity';
import { Game } from '@hell-pong/shared/constants/game';

export abstract class Entity {
  protected body!: Body;
  protected constructor() {
    // You can add any shared properties or methods for all components here.
  }

  getBody(): Body {
    return this.body;
  }

  get velocity(): Velocity {
    return new Velocity(this.body.velocity.x, this.body.velocity.y);
  }

  get position(): Position {
    return new Position(this.body.position.x, this.body.position.y);
  }

  get size(): Size {
    const width = this.body.bounds.max.x - this.body.bounds.min.x;
    const height = this.body.bounds.max.y - this.body.bounds.min.y;
    return new Size(width, height);
  }

  public addToWorld(world: World): Entity {
    World.add(world, this.body);
    return this;
  }

  public bodyEquals(body: Body): boolean {
    return this.body === body;
  }

  public labelEquals(label: string): boolean {
    return this.body.label === label;
  }

  protected collidesInPair({ bodyA, bodyB }: Pair): boolean {
    return this.labelEquals(bodyA.label) || this.labelEquals(bodyB.label);
  }

  protected collidesInPairWith({ bodyA, bodyB }: Pair, label: string): boolean {
    const collidesA = bodyA.label === label && this.labelEquals(bodyB.label);
    const collidesB = bodyB.label === label && this.labelEquals(bodyA.label);
    return collidesA || collidesB;
  }

  protected collidingWithHorizontalWalls(pair: Pair): boolean {
    return this.collidesInPairWith(pair, Game.Wall.LeftLabel) || this.collidesInPairWith(pair, Game.Wall.RightLabel);
  }

  protected collidingWithVerticalWalls(pair: Pair): boolean {
    return this.collidesInPairWith(pair, Game.Wall.TopLabel) || this.collidesInPairWith(pair, Game.Wall.BottomLabel);
  }
}
