import { MarkerFlags, Flaggable } from './flags';
import { Marker } from './marker';
import CONSTANTS from './constants';
import { Settings } from './settings';

export interface MarkerData {
    colour?: string,
    on?: (token: Token) => boolean
}

export class MacroMarker {
    constructor(private settings: Settings, private user: Flaggable) { }

    getMarker(macro: Macro & Flaggable, token?: Flaggable): Marker | undefined {
        const flags = token ? [ this.user, token, macro ] : [ this.user, macro ];
        return flags
            .map(flag => new MarkerFlags(flag))
            .reduce<Marker | undefined>((marker, flag) => marker || flag.getMarkers()[macro.id], undefined);
    }

    toggleTokenMacro(macro: Macro, token: Flaggable, colour?: string): Promise<Flaggable> {
        return this._toggleMacro(macro, new MarkerFlags(token), colour);
    }

    toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        return this._toggleMacro(macro, new MarkerFlags(user), colour);
    }

    toggleMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        return this._toggleMacro(macro, new MarkerFlags(macro), colour);
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