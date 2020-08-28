import Router from "@koa/router";
import { readdirSync, statSync } from "fs";
import Koa, { Middleware } from "koa";
import path from "path";
import { logger } from "./utils";

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

  static async run(config: ApplicationConfig): Promise<void> {
    if (Application.running) {
      return;
    }

    logger.info("Application initializing...");

    Application.running = true;

    Application.port = config.port;
    Application.components = config.components;

    Application.loadAllComponents();
    Application.registerMiddlewares();

    return new Promise((resolve) => {
      Application.koa.listen(Application.port, () => {
        logger.info("Server running on port", Application.port);
        resolve();
      });
    });
  }

  static getKoa(): Koa {
    return Application.koa;
  }

  static use(middleware: Middleware): void {
    Application.koa.use(middleware);
  }

  static registerRouter(router: Router): void {
    Application.mainRouter.use(router.routes(), router.allowedMethods());
  }

  private static loadAllComponents(): void {
    const entryDir = Application.getProjectEntryDir();

    Application.components.forEach((relativePath) => {
      Application.loadComponent(path.resolve(entryDir, relativePath));
    });
  }

  private static getProjectEntryDir(): string {
    if (!require.main) {
      throw new Error("cannot get project entry directory");
    }

    return require.main.path ?? path.dirname(require.main.filename);
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
      if (
        !require.cache[sourcePath] &&
        require.extensions[path.extname(sourcePath)]
      ) {
        logger.info("Load source:", sourcePath);
        require(sourcePath);
      }
    }
  };

  private static validateSourceFile(sourcePath: string): boolean {
    return Application.sourceFileRegExp.test(sourcePath);
  }
}
