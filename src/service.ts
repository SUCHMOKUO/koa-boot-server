import { Component, ComponentClass } from "./ioc";

export interface ServiceClass extends ComponentClass {}

export function Service(Class: ServiceClass): void {
  Component(Class);
}
