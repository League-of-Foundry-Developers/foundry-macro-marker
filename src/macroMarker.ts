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

    getMarker(macro: Macro & Flaggable, token?: Token & Flaggable): Marker | undefined {
        if (!macro) {
            this.logger.error('Get Marker | Macro is undefined.'); 
            return;
        }

        const entity = token?.data.actorLink && token.actor
            ? token.actor
            : token;

        const flags = [ macro, this.user ];
        if (entity) flags.push(entity);

        for(const flag of flags) {
            const marker = new MarkerFlags(this.logger, flag).getMarkers()[macro.id];
            if (marker) return marker;
        }
    }

    async toggleTokenMacro(macro: Macro, token: Token & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._toggleMacro(macro, new MarkerFlags(this.logger, entity), colour);
    }

    async toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        return this._toggleMacro(macro, new MarkerFlags(this.logger, user), colour);
    }

    async toggleMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.'); 
            return Promise.reject();
        }
        
        return this._toggleMacro(macro, new MarkerFlags(this.logger, macro), colour);
    }

    /**
     * Clear all markers for a given macro from the users and macro itself.
     * @param macro the macro for which to clear markers
     */
    clearMarkers(macro: Macro & Flaggable): Promise<Flaggable[]> {
        const macroFlags = new MarkerFlags(this.logger, macro);
        const pMacro = macroFlags.unsetMarker(macro.id);

        const userFlags: MarkerFlags[] = game.users.map(user => new MarkerFlags(this.logger, user));
        const psUser = userFlags.map(flag => flag.unsetMarker(macro.id));

        return Promise.all([ pMacro, ...psUser ]);
    }

    private _toggleMacro(macro: Macro, flags: MarkerFlags, colour?: string): Promise<Flaggable>{
        const existingMarker: Marker | undefined = flags.getMarkers()[macro.id];
        colour = colour?.toString(); // Ensure colour really is a string to prevent stack overflows (in case it's an entity)

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