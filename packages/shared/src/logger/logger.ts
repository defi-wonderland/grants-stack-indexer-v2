import { createLogger, format, transports, Logger as WinstonLogger } from "winston";

import { ILogger } from "./logger.interface.js";

type LogLevel = "error" | "warn" | "info" | "debug";

const validLogLevels: LogLevel[] = ["error", "warn", "info", "debug"];

export class Logger implements ILogger {
    private logger: WinstonLogger;
    private static instance: Logger | null;
    private level: LogLevel;
    private constructor() {
        this.level = this.isValidLogLevel(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : "info";
        this.logger = createLogger({
            level: this.level,
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.errors({ stack: true }),
                format.printf(({ level, message, timestamp, stack }) => {
                    return `${timestamp} ${level}: ${stack ?? message ?? ""}`;
                }),
            ),
            transports: [new transports.Console()],
        });
    }
    /**
     * Returns the instance of the Logger class.
     * @param level The log level to be used by the logger.
     * @returns The instance of the Logger class.
     */
    public static getInstance(): ILogger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    isValidLogLevel(level?: string): level is LogLevel {
        return validLogLevels.includes(level as LogLevel);
    }

    info(message: string): void {
        this.logger.info(message);
    }
    error(error: Error | string): void {
        if (error instanceof Error) {
            this.logger.error(error);
        } else {
            this.logger.error(new Error(error));
        }
    }
    warn(message: string): void {
        this.logger.warn(message);
    }
    debug(message: string): void {
        this.logger.debug(message);
    }
}
