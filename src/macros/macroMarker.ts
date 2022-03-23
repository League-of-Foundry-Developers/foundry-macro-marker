import { Flaggable, MacroMarkerFlags } from './macroMarkerFlags';
import { MarkerConfigurationFlags } from '../markerConfiguration/markerConfigurationFlags';
import CONSTANTS from '../utils/constants';
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

        const entity = this.getLinkedEntity(token);

        // TODO: refactor to get rid of the switch
        const collection = new MacroMarkerFlags(this.logger, macro).getMarkers();
        switch(collection.type) {
        case 'Macro':
            return collection.markers[macro.id];
        case 'Token':
            return entity && collection.markers[entity.id];
        case 'User':
            return collection.markers[this.user.id];
        }
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleTokenMacro(macro: Macro, token: Token & Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleTokenMacro is deprecated and will soon be removed. Use `MacroMarker.toggle(macro, { entity: token })` instead.');
        return this._toggleTokenMacro(macro, token);
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleUserMacro(macro: Macro, user: Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleUserMacro is deprecated and will soon be removed. Use `MacroMarker.toggle(macro, { entity: user })` instead.');
        return this._toggleUserMacro(macro, user);
    }

    /**
     * @deprecated use MacroMarker.toggle instead
     * Will be removed in v1.1.0
     */
    async toggleMacro(macro: Macro & Flaggable): Promise<Flaggable> {
        this.logger.warn('toggleMacro is deprecated and will soon be removed. Use `MacroMarker.toggle(macro)` instead.');
        return this._toggleWorldMacro(macro);
    }

    public isActive(macro: Macro & Flaggable, data?: ToggleData): boolean {
        return this.isActiveWithColour(macro, data).isActive;
    }

    public isActiveWithColour(macro: Macro & Flaggable, data?: ToggleData): { isActive: boolean, colour?: string } {
        if (!macro) {
            this.logger.warn('IsActive | macro is undefined');
            return { isActive: false };
        }

        const trigger = this.evaluateTrigger(macro);

        if (trigger !== null)
            return trigger;

        const token = data?.token || (data?.entity?.markerType === 'Token' ? <Token>data.entity : undefined);
        const isActive = this.getMarker(macro, token) || false;
        return { isActive };
    }

    public toggle(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (!macro) {
            this.logger.warn('Toggle | macro is undefined');
            return Promise.reject();
        }

        if (data?.token && data.user) {
            this.logger.warn('Markers cannot be set on both tokens and users.');
            Promise.reject();
        }
        if (data?.token || data?.user) {
            this.logger.warn('`toggle(macro, { token } and { user })` are deprecated and will soon be removed. Please use `MacroMarker.toggle(macro, { entity: token })` or `MacroMarker.toggle(macro, { entity: user })` instead.');
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
        if (!macro) {
            this.logger.warn('Activate | macro is undefined');
            return Promise.reject();
        }

        if (this.isActive(macro, data))
            return Promise.resolve(macro);

        return this.toggle(macro, data);
    }

    public deactivate(macro: Macro & Flaggable, data?: ToggleData): Promise<Flaggable> {
        if (!macro) {
            this.logger.warn('Deactivate | macro is undefined');
            return Promise.reject();
        }

        if (!this.isActive(macro, data))
            return Promise.resolve(macro);

        return this.toggle(macro, data);
    }

    private getLinkedEntity(token: Token | undefined) {
        return token?.data.actorLink && token.actor
            ? token.actor
            : token;
    }

    private async _toggleTokenMacro(macro: Macro, token: Token & Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._toggleMacro(macro, entity);
    }

    private async _toggleUserMacro(macro: Macro, user: Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle User | Macro is undefined.');
        if (!user) this.logger.error('Toggle User | User is undefined.');
        if (!user || !macro) return Promise.reject();

        return this._toggleMacro(macro, user);
    }

    private async _toggleWorldMacro(macro: Macro & Flaggable): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Macro | Macro is undefined.');
            return Promise.reject();
        }

        return this._toggleMacro(macro, macro);
    }

    private async _toggleMacro(macro: Macro, flaggable: Flaggable): Promise<Flaggable>{
        const flags = new MacroMarkerFlags(this.logger, macro);
        const existingMarker: boolean | undefined = flags.getMarkers().markers[flaggable.id];

        // TODO: extract condition if it needs to be testable
        if (macro.testUserPermission(game.user, CONST.ENTITY_PERMISSIONS.OWNER))
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

    private evaluateTrigger(macro: Macro): { isActive: boolean, colour?: string } | null {
        const config = new MarkerConfigurationFlags(this.logger, macro).getData();
        const selectedToken = this.listControlledTokens()[0];

        if (!config.trigger) {
            return null;
        }
        const trigger = Function(`return function(token, actor, character) { ${config.trigger} }`)();

        try {
            const result = trigger.call(macro, selectedToken, selectedToken?.actor, game.user.character);
            const isActive = !!result;
            const colour = typeof result === 'string' ? result : undefined;
            return { isActive, colour };
        } catch(error) {
            this.logger.error('Evaluate Trigger |', error);
            this.logger.info('Evaluate Trigger | Falling back to flags');
            return null;
        }
    }
}