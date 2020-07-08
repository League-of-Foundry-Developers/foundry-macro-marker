import { MarkerFlags, Flaggable } from './flags';
import { Marker } from './marker';
import CONSTANTS from './constants';
import { Settings } from './settings';
import { Logger } from './logger';
import { MarkerCleaner } from './markerCleaner';
import { RemoteExecutor } from './remoteExecutor';

interface ToggleData {
    token?: Token & Flaggable,
    user?: Flaggable,
    colour?: string
}

export class MacroMarker {
    constructor(
        private logger: Logger,
        private settings: Settings,
        private user: Flaggable,
        private listControlledTokens: () => (Token & Flaggable)[]) { }

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

        const cleaner = new MarkerCleaner(this.logger);
        cleaner.clearUserMarkers(macro, this.user);
        cleaner.clearMarkers(macro);

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._toggleMacro(macro, new MarkerFlags(this.logger, entity), colour);
    }

    async toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        const cleaner = new MarkerCleaner(this.logger);
        const token = this.listControlledTokens()[0];
        if (token)
            cleaner.clearTokenMarkers(macro, token);

        cleaner.clearMarkers(macro);

        return this._toggleMacro(macro, new MarkerFlags(this.logger, user), colour);
    }

    async toggleMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.'); 
            return Promise.reject();
        }

        const cleaner = new MarkerCleaner(this.logger);
        const token = this.listControlledTokens()[0];
        if (token)
            cleaner.clearTokenMarkers(macro, token);

        cleaner.clearUserMarkers(macro, this.user);
        
        return this._toggleMacro(macro, new MarkerFlags(this.logger, macro), colour);
    }
    
    public isActive(macro: Macro & Flaggable, data?: { token?: Token & Flaggable, user?: Flaggable }): boolean {
        let entity: Flaggable = macro;
        if (data?.token)
            entity = data.token.data.actorLink && data.token.actor
                ? data.token.actor
                : data.token;
        else if (data?.user)
            entity = data.user;

        const markers = new MarkerFlags(this.logger, entity);
        return markers.getMarkers()[macro.id]?.active || false;
    }

    public toggle(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (data?.token && data.user) {
            ui.notifications.warn('Markers cannot be set on both tokens and users.');
            Promise.reject();
        }

        if (data?.token)
            return this.toggleTokenMacro(macro, data.token, data.colour);
        else if(data?.user)
            return this.toggleUserMacro(macro, data.user, data.colour);
        else
            return this.toggleMacro(macro, data?.colour);
    }

    public activate(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (this.isActive(macro, data))
            return Promise.resolve(macro);

        return this.toggle(macro, data);
    }

    public deactivate(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (!this.isActive(macro, data))
            return Promise.resolve(macro);

        return this.toggle(macro, data);
    }

    private async _toggleMacro(macro: Macro, flags: MarkerFlags, colour?: string): Promise<Flaggable>{
        const existingMarker: Marker | undefined = flags.getMarkers()[macro.id];

        // Ensure colour really is a string to prevent stack overflows (in case it's an entity)
        colour = colour?.toString() || existingMarker?.colour;

        const marker = existingMarker
            ? { active: !existingMarker.active, colour }
            : { active: true, colour };

        // TODO: inject
        if (game.user.isGM)
            return flags.addMarker(macro.id, marker)
                .then(flaggable => {
                    Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                    return flaggable;
                });

        const gm = RemoteExecutor.create(this.logger);
        return gm.updateMarker(macro.id, marker, flags.flaggable)
            .then(() => {
                this.logger.debug('Remote execution completed.');
                Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                return flags.flaggable;
            });
    }
}