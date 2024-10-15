/**
 * Generic logger interface.
 */
export interface ILogger {
    error: (error: Error | string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
}
