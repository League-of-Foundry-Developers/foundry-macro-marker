import { Flaggable, MigratingMarkerFlags } from './macroMarkerFlags';
import { MarkerConfigurationFlags } from '../markerConfiguration/markerConfigurationFlags';
import CONSTANTS from '../utils/constants';
import { Settings } from '../utils/settings';
import { Logger } from '../utils/logger';
import { RemoteExecutor } from '../remoteExecutor';

interface ToggleData {
    /**
     * @deprecated use ToggleData.entity instead
     * Will be removed in v1.1.0
     */
    token?: Token & Flaggable,
    /**
     * @deprecated use ToggleData.entity instead
     * Will be removed in v1.1.0
     */
    user?: User & Flaggable,
    entity?: Flaggable
}

export class MacroMarker {
    constructor(
        private logger: Logger,
        private user: Flaggable,
        private listControlledTokens: () => (Token & Flaggable)[]) { }

    getMarker(macro: Macro & Flaggable, token?: Token & Flaggable): boolean | undefined {
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
            const collection = new MigratingMarkerFlags(this.logger, macro, flag).getMarkers();
            if (collection.markers[flag.id]) {
                return collection.markers[flag.id];
            }
        }
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleTokenMacro(macro: Macro, token: Token & Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleTokenMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleTokenMacro(macro, token);
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleUserMacro(macro: Macro, user: Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleUserMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleUserMacro(macro, user);
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleMacro(macro: Macro & Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleMacro is deprecated and will soon be removed. Use toggle instead.');
        return this._toggleWorldMacro(macro);
    }
    
    public isActive(macro: Macro & Flaggable, data?: ToggleData): boolean {
        const trigger = this.evaluateTrigger(macro);

        if (trigger !== null)
            return trigger;
            
        let entity: Flaggable = macro;
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

        const markers = new MigratingMarkerFlags(this.logger, macro, entity);
        const isActive = markers.getMarkers().markers[entity.id];
        return isActive || false;
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
            return this._toggleTokenMacro(macro, <Token>data.entity);
        else if(data?.entity && type === 'User')
            return this._toggleUserMacro(macro, data.entity);

        return this._toggleWorldMacro(macro);
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

    async _toggleTokenMacro(macro: Macro, token: Token & Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._toggleMacro(macro, entity);
    }

    async _toggleUserMacro(macro: Macro, user: Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        return this._toggleMacro(macro, user);
    }

    async _toggleWorldMacro(macro: Macro & Flaggable): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.'); 
            return Promise.reject();
        }

        return this._toggleMacro(macro, macro);
    }

    private async _toggleMacro(macro: Macro, flaggable: Flaggable): Promise<Flaggable>{
        const flags = new MigratingMarkerFlags(this.logger, macro, flaggable);
        const existingMarker: boolean | undefined = flags.getMarkers().markers[flaggable.id];

        // TODO: extract condition if it needs to be testable
        if (macro.hasPerm(game.user, CONST.ENTITY_PERMISSIONS.OWNER))
            return flags.addMarker(flaggable, !existingMarker)
                .then(updatedFlaggable => {
                    Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                    return updatedFlaggable;
                });

        // TODO: inject if it needs to be testable
        const gm = RemoteExecutor.create(this.logger);
        return gm.updateMarker(macro.id, !existingMarker, flaggable)
            .then(() => {
                this.logger.debug('Remote execution completed.');
                Hooks.callAll(CONSTANTS.hooks.markerUpdated, macro, flags.getMarkers()[macro.id]);
                return flaggable;
            });
    }

    private evaluateTrigger(macro: Macro): boolean | null {
        const config = new MarkerConfigurationFlags(this.logger, macro).getData();
        const selectedToken = this.listControlledTokens()[0];
            
        if (!config.trigger) {
            return null;
        }
        const trigger = Function(`return function(token, actor, character) { ${config.trigger} }`)();

        return !!trigger.call(macro, selectedToken, selectedToken?.actor, game.user.character);
    }
}