import CONSTANTS from './constants';

export interface Logger {
    error(...message: unknown[]): void;
    warn(...message: unknown[]): void;
    info(...message: unknown[]): void;
    debug(...message: unknown[]): void;
}

export class NotifiedLogger implements Logger {
    constructor(private logger: Logger) { }

    error(...message: unknown[]): void {
        ui.notifications.error('Macro Marker: An error occurred, please check the console (F12).');
        this.logger.error(...message);
    }

    warn(...message: unknown[]): void {
        ui.notifications.warn('Macro Marker: Warning! Please check the console (F12).');
        this.logger.warn(...message);
    }

    info(...message: unknown[]): void {
        this.logger.info(...message);
    }

    debug(...message: unknown[]): void {
        this.logger.debug(...message);
    }
}

export class ConsoleLogger implements Logger {
    readonly prefix = `${CONSTANTS.module.title} |`;

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