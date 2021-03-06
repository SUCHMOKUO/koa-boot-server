import "reflect-metadata";
import { ComponentClass, Prototype } from "./types";
import { logger } from "./utils";

const instanceContainer = new Map<ComponentClass, unknown>();

export function Component(Class: ComponentClass) {
  if (instanceContainer.has(Class)) {
    return;
  }

  instanceContainer.set(Class, new Class());

  logger.debug("Component instantiated:", Class);
}

export function Inject(prototype: Prototype, fieldName: string) {
  const Class = Reflect.getMetadata("design:type", prototype, fieldName);

  if (typeof Class === "undefined") {
    logger.error(
      "Cannot get inject type, try enabling 'emitDecoratorMetadata' or check for circular dependency"
    );

    throw new Error("cannot get inject type");
  }

  const instance = getInstance(Class);

  Object.defineProperty(prototype, fieldName, {
    get() {
      return instance;
    },
    set() {
      throw new Error(`cannot set injected field '${fieldName}'`);
    },
  });

  logger.debug("Injected", Class, "to", prototype.constructor);
}

export function getInstance<T extends ComponentClass>(
  Class: T
): InstanceType<T> {
  const instance = instanceContainer.get(Class);

  if (!instance) {
    throw new Error(`no component instance of class '${Class.name}'`);
  }

  return instance as InstanceType<T>;
}
