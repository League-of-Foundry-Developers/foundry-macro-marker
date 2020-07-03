import { Settings } from './settings';
import CONSTANTS from './constants';

export interface Logger {
    error(...message: unknown[]): void;
    warn(...message: unknown[]): void;
    info(...message: unknown[]): void;
    debug(...message: unknown[]): void;
}

export class ConsoleLogger {
    readonly prefix = `${CONSTANTS.module.title} | `;

    error(...message: unknown[]): void {
        console.error.apply(null, this.addPrefix(message));
    }

    warn(...message: unknown[]): void {
        console.warn.apply(null, this.addPrefix(message));
    }

    info(...message: unknown[]): void {
        console.info.apply(null, this.addPrefix(message));
    }

    debug(...message: unknown[]): void {
        console.debug.apply(null, this.addPrefix(message));
    }

    private addPrefix(message: unknown[]) {
        message.unshift(this.prefix);
        return message;
    }
}