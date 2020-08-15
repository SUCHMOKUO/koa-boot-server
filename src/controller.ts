import { Component, getInstance, ComponentClass } from "./ioc";
import Router from "@koa/router";
import { Application } from "./application";
import { MethodDecorator } from "./types";

interface ControllerClass extends ComponentClass {}

type ControllerDecorator = (Class: ControllerClass) => void;

type HttpMethod = "get" | "post" | "put" | "delete" | "options" | "patch";

type RouteMethod = {
  method: HttpMethod;
  url: string;
  methodName: string;
};

const ROUTE_METHODS = Symbol("ROUTES");

let currentRouter: Router | undefined;

function controllerDecorator(Class: ControllerClass): void {
  Component(Class);

  const instance = getInstance(Class);
  const prototype = Class.prototype;

  const routeMethods: RouteMethod[] | undefined = prototype[ROUTE_METHODS];

  if (!routeMethods) {
    return;
  }

  if (!currentRouter) {
    currentRouter = new Router();
  }

  for (const routeMethod of routeMethods) {
    const { method, url, methodName } = routeMethod;
    const handler = prototype[methodName].bind(instance);

    currentRouter[method](url, handler);
  }

  Application.registerRouter(currentRouter);
  currentRouter = undefined;
}

export function Controller(Class: ControllerClass): void;
export function Controller(prefix: string): ControllerDecorator;
export function Controller(
  arg: ControllerClass | string
): void | ControllerDecorator {
  if (typeof arg === "string") {
    currentRouter = new Router({ prefix: arg });

    return controllerDecorator;
  }

  controllerDecorator(arg);
}

function RequestMethod(method: HttpMethod) {
  function decorator(url: string): MethodDecorator;
  function decorator(prototype: any, methodName: string): void;
  function decorator(...args: any[]): void | MethodDecorator {
    let url = "/";

    function _decorator(prototype: any, methodName: string) {
      let routeMethods: RouteMethod[] = prototype[ROUTE_METHODS];

      if (!routeMethods) {
        routeMethods = prototype[ROUTE_METHODS] = [];
      }

      routeMethods.push({ method, url, methodName });
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
export const Options = RequestMethod("options");
export const patch = RequestMethod("patch");
