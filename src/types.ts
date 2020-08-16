export interface Class {
  new (): void;
}

export type MethodDecorator = (
  prototype: Prototype,
  methodName: string
) => void;

export interface Prototype {
  constructor: Function;
}
