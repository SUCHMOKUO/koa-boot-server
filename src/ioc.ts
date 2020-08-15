import "reflect-metadata";

export interface ComponentClass {
  new (): void;
}

const instanceContainer = new Map<ComponentClass, unknown>();

export function Component(Class: ComponentClass) {
  if (instanceContainer.has(Class)) {
    return;
  }

  instanceContainer.set(Class, new Class());
}

export function Inject(prototype: object, fieldName: string) {
  const Class = Reflect.getMetadata("design:type", prototype, fieldName);
  const instance = getInstance(Class);

  Object.defineProperty(prototype, fieldName, {
    get() {
      return instance;
    },
    set() {
      throw new Error(`cannot set injected field '${fieldName}'`);
    },
  });
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
