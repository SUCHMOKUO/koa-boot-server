import "reflect-metadata";
import { logger } from "./utils";
import { Class, Prototype } from "./types";

export interface ComponentClass extends Class {}

const instanceContainer = new Map<ComponentClass, unknown>();

export function Component(Class: ComponentClass) {
  if (instanceContainer.has(Class)) {
    return;
  }

  instanceContainer.set(Class, new Class());

  logger.info("Component instantiated:", Class);
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

  logger.info("Injected", Class, "to", prototype.constructor);
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
