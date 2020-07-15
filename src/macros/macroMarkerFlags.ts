import CONSTANTS from '../utils/constants';
import { MacroMarkerCollection } from '../marker';
import { Logger } from '../utils/logger';
import { MarkerTypes } from '../remoteExecutor';

export class Identifiable {
    id: string;
    markerType: MarkerTypes;
}

export interface Flaggable extends Identifiable {
    setFlag<T>(scope: string, key: string, value: T) : Promise<Flaggable>;
    unsetFlag(scope: string, key: string) : Promise<Flaggable>;
    getFlag<T>(scope: string, key: string) : T | undefined;
}

export class MacroMarkerFlags {
    private readonly key = 'markers';

    constructor(protected logger: Logger, protected macro: Macro) { }

    addMarker(entity: Identifiable, isActive: boolean): Promise<Flaggable> {
        const existingMarkers = this.getMarkers();

        // Markers can only be set for one type to prevent weird toggling behaviour.
        if (existingMarkers.type !== entity.markerType) {
            existingMarkers.markers = {};
            existingMarkers.type = entity.markerType;
        }
        existingMarkers.markers[entity.id] = isActive;
        return this.setMarkers(existingMarkers);
    }

    setMarkers(data: MacroMarkerCollection): Promise<Flaggable> {
        this.logger.debug('Setting Marker', this.macro, data);
        return this.macro.setFlag(CONSTANTS.module.name, this.key, data);
    }

    getMarkers(): MacroMarkerCollection {
        // duplicate to prevent changing the data in the same reference
        // Foundry will not update data that is the same on the entity
        const flags = this.macro.getFlag(CONSTANTS.module.name, this.key) || { markers: {} };
        return duplicate(flags);
    }

    unsetMarkers(): Promise<Flaggable> {
        return this.macro.unsetFlag(CONSTANTS.module.name, this.key);
    }
}
