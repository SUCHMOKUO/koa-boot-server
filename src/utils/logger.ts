import {
  blueBright,
  cyan,
  gray,
  greenBright,
  redBright,
  yellowBright,
} from "chalk";

function getFormatedDate(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function log(type: string, ...messages: any[]): void {
  messages = messages.map((message) => {
    if (typeof message === "function") {
      return cyan(message.name);
    }

    return message;
  });

  console.log(
    `${greenBright("[Koa-Boot]")} ${type} ${gray(`(${getFormatedDate()})`)}`,
    ...messages
  );
}

export const logger = {
  info: (...messages: any[]) => log(blueBright("INFO "), ...messages),
  debug: (...messages: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      log(yellowBright("DEBUG"), ...messages);
    }
  },
  error: (...messages: any[]) => log(redBright("ERROR"), ...messages),
};
