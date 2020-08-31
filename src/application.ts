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
    if (this.running) {
      return;
    }

    logger.info("Application initializing...");

    this.running = true;

    this.port = config.port;
    this.components = config.components;

    this.loadAllComponents();
    this.registerMiddlewares();

    return new Promise((resolve) => {
      this.koa.listen(this.port, () => {
        logger.info("Server running on port", this.port);
        resolve();
      });
    });
  }

  static getKoa(): Koa {
    return this.koa;
  }

  static use(middleware: Middleware): typeof Application {
    this.koa.use(middleware);

    return this;
  }

  static registerRouter(router: Router): void {
    this.mainRouter.use(router.routes(), router.allowedMethods());
  }

  private static loadAllComponents(): void {
    const entryDir = this.getProjectEntryDir();

    this.components.forEach((relativePath) => {
      this.loadComponent(path.resolve(entryDir, relativePath));
    });
  }

  private static getProjectEntryDir(): string {
    if (!require.main) {
      throw new Error("cannot get project entry directory");
    }

    return require.main.path ?? path.dirname(require.main.filename);
  }

  private static registerMiddlewares(): void {
    const { koa, mainRouter } = this;

    koa.use(mainRouter.routes()).use(mainRouter.allowedMethods());
  }

  private static loadComponent(sourcePath: string): void {
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      readdirSync(sourcePath)
        .map((dir) => path.join(sourcePath, dir))
        .forEach((path) => this.loadComponent(path));
    } else if (stat.isFile() && this.validateSourceFile(sourcePath)) {
      if (
        !require.cache[sourcePath] &&
        require.extensions[path.extname(sourcePath)]
      ) {
        logger.debug("Load source:", sourcePath);
        require(sourcePath);
      }
    }
  }

  private static validateSourceFile(sourcePath: string): boolean {
    return this.sourceFileRegExp.test(sourcePath);
  }
}
