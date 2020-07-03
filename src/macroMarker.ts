import { MarkerFlags, Flaggable } from './flags';
import { Marker } from './marker';
import CONSTANTS from './constants';
import { Settings } from './settings';
import { ConsoleLogger } from './logger';

export interface MarkerData {
    colour?: string,
    on?: (token: Token) => boolean
}

export class MacroMarker {
    constructor(private logger: ConsoleLogger, private settings: Settings, private user: Flaggable) { }

    getMarker(macro: Macro & Flaggable, token?: Flaggable): Marker | undefined {
        if (!macro) {
            this.logger.error('Get Marker | Macro is undefined.'); 
            return;
        }

        const flags = token ? [ this.user, token, macro ] : [ this.user, macro ];
        return flags
            .map(flag => new MarkerFlags(this.logger, flag))
            .reduce<Marker | undefined>((marker, flag) => marker || flag.getMarkers()[macro.id], undefined);
    }

    toggleTokenMacro(macro: Macro, token: Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        return this._toggleMacro(macro, new MarkerFlags(this.logger, token), colour);
    }

    toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        return this._toggleMacro(macro, new MarkerFlags(this.logger, user), colour);
    }

    toggleMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.'); 
            return Promise.reject();
        }

        return this._toggleMacro(macro, new MarkerFlags(this.logger, macro), colour);
    }

    private _toggleMacro(macro: Macro, flags: MarkerFlags, colour?: string): Promise<Flaggable>{
        const existingMarker: Marker | undefined = flags.getMarkers()[macro.id];
        const marker = existingMarker
            ?  { active: !existingMarker.active, colour: colour || existingMarker.colour }
            : { active: true, colour: colour || this.settings.defaultColour };

        return flags.addMarker(macro.id, marker)
            .then(flaggable => {
                Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                return flaggable;
            });
    }
}