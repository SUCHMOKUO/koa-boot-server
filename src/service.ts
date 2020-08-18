import { Component } from "./ioc";
import { ServiceClass } from "./types";

export function Service(Class: ServiceClass): void {
  Component(Class);
}
