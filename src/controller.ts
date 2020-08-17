import { Component, getInstance, ComponentClass } from "./ioc";
import Router from "@koa/router";
import { Application } from "./application";
import { MethodDecorator, Prototype } from "./types";

interface ControllerClass extends ComponentClass {}

type ControllerDecorator = (Class: ControllerClass) => void;

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

type ClassRouteMethod = {
  method: HttpMethod;
  url: string;
  classMethodName: string;
};

const CLASS_ROUTE_METHODS = (Symbol(
  "CLASS_ROUTE_METHODS"
) as unknown) as string;

let currentBuildingRouter: Router | undefined;

function controllerDecorator(Class: ControllerClass): void {
  Component(Class);

  const instance = getInstance(Class);
  const prototype = Class.prototype;

  const classRouteMethods: ClassRouteMethod[] | undefined =
    prototype[CLASS_ROUTE_METHODS];

  if (!classRouteMethods) {
    return;
  }

  if (!currentBuildingRouter) {
    currentBuildingRouter = new Router();
  }

  for (const classRouteMethod of classRouteMethods) {
    const { method, url, classMethodName } = classRouteMethod;
    const handlerFunc = prototype[classMethodName].bind(instance);

    currentBuildingRouter[method](url, handlerFunc);
  }

  Application.registerRouter(currentBuildingRouter);
  currentBuildingRouter = undefined;
}

export function Controller(Class: ControllerClass): void;
export function Controller(prefix: string): ControllerDecorator;
export function Controller(
  arg: ControllerClass | string
): void | ControllerDecorator {
  if (typeof arg === "string") {
    currentBuildingRouter = new Router({ prefix: arg });

    return controllerDecorator;
  }

  controllerDecorator(arg);
}

function RequestMethod(method: HttpMethod) {
  function decorator(url: string): MethodDecorator;
  function decorator(prototype: Prototype, methodName: string): void;
  function decorator(...args: any[]): void | MethodDecorator {
    let url = "/";

    function _decorator(prototype: Prototype, methodName: string) {
      let routeMethods: ClassRouteMethod[] | undefined =
        prototype[CLASS_ROUTE_METHODS];

      if (!routeMethods) {
        routeMethods = prototype[CLASS_ROUTE_METHODS] = [];
      }

      routeMethods.push({ method, url, classMethodName: methodName });
    }

    if (typeof args[0] === "string") {
      url = args[0];
      return _decorator;
    }

    _decorator(args[0], args[1]);
  }

  return decorator;
}

export const Get = RequestMethod("get");
export const Post = RequestMethod("post");
export const Delete = RequestMethod("delete");
export const Put = RequestMethod("put");
export const Patch = RequestMethod("patch");
