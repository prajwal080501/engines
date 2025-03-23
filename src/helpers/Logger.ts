import { createLogger, transports, format } from "winston";

export class LoggerManager {
  logger: any;
  constructor() {
    this.logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: "engine.log", level: "error" }),
      ],
    });
  }

  log(level: string, message: string, data: any) {
    this.logger.info({
      level: level,
      message: message,
      data: data,
    });
  }

  logError(level: string, message: string, data: any) {
    this.logger.error({
      level: level,
      message: message,
      data: data,
    });
  }
}
