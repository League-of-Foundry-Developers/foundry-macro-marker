import { Flaggable, MarkerFlags } from './flags';
import { Logger } from './logger';

export class MarkerCleaner {
    constructor(private logger: Logger) { }

    public clearAllMarkers(macro: Macro, user: Flaggable, token: Token & Flaggable): Promise<Flaggable[]> {
        return Promise.all([
            this.clearUserMarkers(macro, user),
            this.clearTokenMarkers(macro, token),
            this.clearMarkers(macro)
        ]);
    }
    
    public clearUserMarkers(macro: Macro, user: Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!user) this.logger.error('Toggle Token | Token is undefined.');
        if (!user || !macro) return Promise.reject();

        return this._clearMarkers(macro, user);
    }

    public clearTokenMarkers(macro: Macro & Flaggable, token: Token & Flaggable): Promise<Flaggable> {
        if (!macro) this.logger.error('Toggle Token | Macro is undefined.');
        if (!token) this.logger.error('Toggle Token | Token is undefined.');
        if (!token || !macro) return Promise.reject();

        const entity: Flaggable = token.data.actorLink && token.actor
            ? token.actor
            : token;

        return this._clearMarkers(macro, entity);
    }

    public clearMarkers(macro: Macro & Flaggable): Promise<Flaggable> {
        if (!macro) {
            this.logger.error('Toggle Token | Macro is undefined.');
            return Promise.reject();
        }
        return this._clearMarkers(macro, macro);
    }

    private _clearMarkers(macro: Macro, flaggable: Flaggable): Promise<Flaggable> {
        const markers = new MarkerFlags(this.logger, flaggable);
        if (!markers.getMarkers()[macro.id]) return Promise.resolve(flaggable);

        return markers.unsetMarker(macro.id);
    }
}