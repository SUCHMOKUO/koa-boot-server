import Koa from "koa";
import path from "path";
import { statSync, readdirSync } from "fs";
import Router from "@koa/router";

export interface ApplicationConfig {
  port: number;
  components: string[];
}

export class Application {
  private static koa = new Koa();
  private static mainRouter = new Router();
  private static port: number;
  private static components: string[];
  private static running = false;
  private static sourceFileRegExp = /\.(js|ts)$/;

  private constructor() {}

  static config(config: ApplicationConfig): typeof Application {
    Application.port = config.port;
    Application.components = config.components;

    return Application;
  }

  static async run(): Promise<void> {
    if (Application.running) {
      return;
    }

    Application.running = true;

    Application.loadAllComponents();
    Application.registerMiddlewares();

    return new Promise((resolve) => {
      Application.koa.listen(Application.port, resolve);
    });
  }

  static getKoa(): Koa {
    return Application.koa;
  }

  static registerRouter(router: Router): void {
    Application.mainRouter.use(router.routes(), router.allowedMethods());
  }

  private static loadAllComponents(): void {
    Application.components.forEach(Application.loadComponent);
  }

  private static registerMiddlewares(): void {
    const { koa, mainRouter } = Application;

    koa.use(mainRouter.routes()).use(mainRouter.allowedMethods());
  }

  private static loadComponent = (sourcePath: string): void => {
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      readdirSync(sourcePath)
        .map((dir) => path.join(sourcePath, dir))
        .forEach(Application.loadComponent);
    } else if (stat.isFile() && Application.validateSourceFile(sourcePath)) {
      require(sourcePath);
    }
  };

  private static validateSourceFile(sourcePath: string): boolean {
    return Application.sourceFileRegExp.test(sourcePath);
  }
}
