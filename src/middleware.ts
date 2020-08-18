import { Middleware as RouterMiddleware } from "@koa/router";
import { ControllerClass, MethodDecorator, ROUTE_MIDDLEWARES } from "./types";

export function Middleware(
  middleware: RouterMiddleware
): MethodDecorator<ControllerClass> {
  return function (prototype, methodName) {
    let allRouteMiddlewares = prototype[ROUTE_MIDDLEWARES];

    if (!allRouteMiddlewares) {
      allRouteMiddlewares = prototype[ROUTE_MIDDLEWARES] = [];
    }

    const routeMiddlewares = allRouteMiddlewares.find(
      ({ classMethodName }) => classMethodName === methodName
    );

    if (!routeMiddlewares) {
      allRouteMiddlewares.push({
        classMethodName: methodName,
        middlewares: [middleware],
      });
    } else {
      routeMiddlewares.middlewares.push(middleware);
    }
  };
}
