import Component from "./component/Component";

export class Entity {
  private components: Map<string, Component> = new Map();

  addComponent<T extends Component>(component: Component) {
    this.components.set(component.constructor.name, component);
  }

  getComponent<T extends Component>(component: { new (...args: any[]): T }): T | undefined {
    return this.components.get(component.name) as T;
  }
}
