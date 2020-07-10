import CONSTANTS from '../utils/constants';
import { Logger } from '../utils/logger';
import { Flaggable } from '../macros/macroMarkerFlags';

/**
 * @deprecated
 * Will be removed in v1.1.0
 */
export interface Marker {
    active: boolean,
    colour: string
}

/**
 * @deprecated
 * Will be removed in v1.1.0
 */
export interface MarkerCollection {
    [macroId: string]: Marker
}

/**
 * @deprecated use MacroMarkerFlags instead
 * Will be removed in v1.1.0
 */
export class EntityMarkerFlags {
    private readonly key = 'activeMacros';
    constructor(private logger: Logger, private flaggable: Flaggable) { }

    addMarker(macroId: string, marker: Marker): Promise<Flaggable> {
        const existingMarkers = this.getMarkers();
        existingMarkers[macroId] = marker;
        return this.setMarkers(existingMarkers);
    }

    setMarkers(data: MarkerCollection): Promise<Flaggable> {
        this.logger.debug('Setting Marker', this.flaggable, data);
        return this.flaggable.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }

    getMarkers(): MarkerCollection {
        return this.flaggable.getFlag(CONSTANTS.module.name, this.key) || {};
    }

    unsetMarker(macroId: string): Promise<Flaggable> {
        const existingMarkers = this.getMarkers();
        delete existingMarkers[macroId];
        return this.setMarkers(existingMarkers);
    }
}
