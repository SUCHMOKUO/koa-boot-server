import Router from "@koa/router";
import { Application } from "./application";
import { Component, getInstance } from "./ioc";
import {
  ClassRouteMethod,
  CLASS_ROUTE_METHODS,
  ControllerClass,
  ControllerDecorator,
  ControllerPrototype,
  HttpMethod,
  MethodDecorator,
  ROUTE_MIDDLEWARES,
} from "./types";

let currentBuildingRouter: Router | undefined;

function controllerDecorator(Class: ControllerClass): void {
  Component(Class);

  const instance = getInstance(Class);
  const prototype = Class.prototype;

  const classRouteMethods = prototype[CLASS_ROUTE_METHODS];

  if (!classRouteMethods) {
    return;
  }

  const allRouteMiddlewares = prototype[ROUTE_MIDDLEWARES] ?? [];

  currentBuildingRouter = currentBuildingRouter ?? new Router();

  for (const classRouteMethod of classRouteMethods) {
    const { method, url, classMethodName } = classRouteMethod;
    const handlerFunc = prototype[classMethodName].bind(instance);
    const middlewares =
      allRouteMiddlewares.find(
        (routeMiddlewares) =>
          routeMiddlewares.classMethodName === classMethodName
      )?.middlewares ?? [];

    currentBuildingRouter[method](url, ...middlewares, handlerFunc);
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

function requestMethodFactory(method: HttpMethod) {
  function decorator(url: string): MethodDecorator<ControllerClass>;
  function decorator(prototype: ControllerPrototype, methodName: string): void;
  function decorator(...args: any[]): MethodDecorator<ControllerClass> | void {
    let url = "/";

    function _decorator(prototype: ControllerPrototype, methodName: string) {
      let classRouteMethods: ClassRouteMethod[] | undefined =
        prototype[CLASS_ROUTE_METHODS];

      if (!classRouteMethods) {
        classRouteMethods = prototype[CLASS_ROUTE_METHODS] = [];
      }

      classRouteMethods.push({
        method,
        url,
        classMethodName: methodName,
      });
    }

    if (typeof args[0] === "string") {
      url = args[0];
      return _decorator;
    }

    _decorator(args[0], args[1]);
  }

  return decorator;
}

export const Get = requestMethodFactory("get");
export const Post = requestMethodFactory("post");
export const Delete = requestMethodFactory("delete");
export const Put = requestMethodFactory("put");
export const Patch = requestMethodFactory("patch");
