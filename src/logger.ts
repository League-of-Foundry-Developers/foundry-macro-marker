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
        console.error.apply(null, [ this.prefix, ...message ]);
    }

    warn(...message: unknown[]): void {
        console.warn.apply(null, [ this.prefix, ...message ]);
    }

    info(...message: unknown[]): void {
        console.info.apply(null, [ this.prefix, ...message ]);
    }

    debug(...message: unknown[]): void {
        console.debug.apply(null, [ this.prefix, ...message ]);
    }
}