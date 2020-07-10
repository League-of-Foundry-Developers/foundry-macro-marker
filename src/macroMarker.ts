import { Flaggable, EntityMarkerFlags, MacroMarkerFlags } from './flags';
import { Marker } from './marker';
import CONSTANTS from './constants';
import { Settings } from './settings';
import { Logger } from './logger';
import { MarkerCleaner } from './markerCleaner';
import { RemoteExecutor } from './remoteExecutor';

interface ToggleData {
    /**
     * @deprecated use ToggleData.entity instead
     */
    token?: Token & Flaggable,
    /**
     * @deprecated use ToggleData.entity instead
     */
    user?: User & Flaggable,
    entity?: (Token | User) & Flaggable, 
    colour?: string
}

interface ExecutionContext {
    token?: Token,
    actor?: Actor
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
            const marker = new EntityMarkerFlags(this.logger, flag).getMarkers()[macro.id];
            if (marker) return marker;
        }
    }

    /**
     * @deprecated use MacroMarer.toggle instead
     */
    async toggleTokenMacro(macro: Macro, token: Token & Flaggable, colour?: string): Promise<Flaggable> {
        this.logger.warn('toggleTokenMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleTokenMacro(macro, token, colour);
    }

    /**
     * @deprecated use MacroMarer.toggle instead
     */
    async toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        this.logger.warn('toggleUserMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleUserMacro(macro, user, colour);
    }

    /**
     * @deprecated use MacroMarer.toggle instead
     */
    async toggleMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        this.logger.warn('toggleMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleWorldMacro(macro, colour);
    }
    
    public isActive(macro: Macro & Flaggable, data?: ToggleData): boolean {
        let entity: (Macro | User | Token | Actor) & Flaggable = macro;
        const type = data?.entity?.constructor.name;
        if (data?.token || type === Token.constructor.name) {
            const token = data?.token ?? <Token>data?.entity;
            entity = token?.data.actorLink && token.actor
                ? token.actor
                : token;
        } else if (data?.user) {
            entity = data.user;
        } else if (data?.entity && type === User.constructor.name) {
            entity = data.entity;
        }

        const markers = new EntityMarkerFlags(this.logger, entity);
        return markers.getMarkers()[macro.id]?.active || false;
    }

    public toggle(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (data?.token && data.user) {
            this.logger.warn('Markers cannot be set on both tokens and users.');
            Promise.reject();
        }
        if (data?.token || data?.user) {
            this.logger.warn('`toggle(macro, { token } and { user })` are deprecated and will soon be removed. Please use `toggle(macro, { entity: token } and { entity: user })` instead.');
        }
        if (data && !data?.entity) {
            data.entity = data?.token || data?.user;
        }

        const type = data?.entity?.markerType;
        // TODO: extract logic to determine what type of entity it is?
        if (data?.entity && type === 'Token')
            return this._toggleTokenMacro(macro, <Token & Flaggable>data.entity, data.colour);
        else if(data?.entity && type === 'User')
            return this._toggleUserMacro(macro, data.entity, data.colour);

        return this._toggleWorldMacro(macro, data?.colour);
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

    async _toggleTokenMacro(macro: Macro, token: Token & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        const cleaner = new MarkerCleaner(this.logger);
        cleaner.clearUserMarkers(macro, this.user);
        cleaner.clearMarkers(macro);

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._toggleMacro(macro, entity, colour);
    }

    async _toggleUserMacro(macro: Macro, user: Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        const cleaner = new MarkerCleaner(this.logger);
        const token = this.listControlledTokens()[0];
        if (token)
            cleaner.clearTokenMarkers(macro, token);

        cleaner.clearMarkers(macro);

        return this._toggleMacro(macro, user, colour);
    }

    async _toggleWorldMacro(macro: Macro & Flaggable, colour?: string): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.'); 
            return Promise.reject();
        }

        const cleaner = new MarkerCleaner(this.logger);
        const token = this.listControlledTokens()[0];
        if (token)
            cleaner.clearTokenMarkers(macro, token);

        cleaner.clearUserMarkers(macro, this.user);
        
        return this._toggleMacro(macro, macro, colour);
    }

    private async _toggleMacro(macro: Macro, flaggable: Flaggable, colour?: string): Promise<Flaggable>{
        const flags = new EntityMarkerFlags(this.logger, flaggable);
        const existingMarker: Marker | undefined = flags.getMarkers()[macro.id];

        // Ensure colour really is a string to prevent stack overflows (in case it's an entity)
        colour = colour?.toString() || existingMarker?.colour;

        const marker = existingMarker
            ? { active: !existingMarker.active, colour }
            : { active: true, colour };

        // TODO: extract condition if it needs to be testable
        if (macro.hasPerm(game.user, CONST.ENTITY_PERMISSIONS.OWNER))
            return flags.addMarker(macro.id, marker)
                .then(updatedFlaggable => {
                    Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                    return updatedFlaggable;
                });


        // TODO: inject if it needs to be testable
        const gm = RemoteExecutor.create(this.logger);
        return gm.updateMarker(macro.id, marker, flaggable)
            .then(() => {
                this.logger.debug('Remote execution completed.');
                Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                return flaggable;
            });
    }
}