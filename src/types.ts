import { Middleware } from "@koa/router";

export interface ParameterlessClass {
  new (): void;
  prototype: Prototype;
}

export type MethodDecorator<
  T extends ParameterlessClass = ParameterlessClass
> = (prototype: T["prototype"], methodName: string) => void;

export interface Prototype {
  constructor: Function;
  [key: string]: any;
}

export interface ComponentClass extends ParameterlessClass {}

export interface ControllerClass extends ComponentClass {
  prototype: ControllerPrototype;
}

export type ControllerDecorator = (Class: ControllerClass) => void;

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export const CLASS_ROUTE_METHODS = Symbol("CLASS_ROUTE_METHODS");
export const ROUTE_MIDDLEWARES = Symbol("ROUTE_MIDDLEWARES");

export type ClassRouteMethod = {
  method: HttpMethod;
  url: string;
  classMethodName: string;
};

export type RouteMiddlewares = {
  classMethodName: string;
  middlewares: Middleware[];
};

export interface ControllerPrototype extends Prototype {
  [CLASS_ROUTE_METHODS]?: ClassRouteMethod[];
  [ROUTE_MIDDLEWARES]?: RouteMiddlewares[];
}

export interface ServiceClass extends ComponentClass {}
