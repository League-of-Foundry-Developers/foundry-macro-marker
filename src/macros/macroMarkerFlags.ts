import CONSTANTS from '../utils/constants';
import { MacroMarkerCollection } from '../marker';
import { Logger } from '../utils/logger';
import { MarkerTypes } from '../remoteExecutor';
import { EntityMarkerFlags } from '../deprecated/EntityMarkerFlags';

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
        return this.macro.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }

    getMarkers(): MacroMarkerCollection {
        return this.macro.getFlag(CONSTANTS.module.name, this.key) || { markers: {} };
    }

    unsetMarkers(): Promise<Flaggable> {
        return this.macro.unsetFlag(CONSTANTS.module.name, this.key);
    }
}

export class MigratingMarkerFlags extends MacroMarkerFlags {
    constructor(logger: Logger, macro: Macro, private flaggable: Flaggable) {
        super(logger, macro);
    }

    addMarker(entity: Flaggable, isActive: boolean): Promise<Flaggable> {
        const oldFlags = new EntityMarkerFlags(this.logger, this.flaggable);
        const result = super.addMarker(entity, isActive);
        oldFlags.unsetMarker(this.macro.id);
        return result;
    }

    getMarkers(): MacroMarkerCollection {
        const oldFlags = new EntityMarkerFlags(this.logger, this.flaggable);
        const oldMarkers = oldFlags.getMarkers();
        const newMarkers = super.getMarkers();

        if (newMarkers.type === this.flaggable.markerType) {
            this.logger.debug('Migration', { macro: this.macro.id, type: this.flaggable.markerType, entity: this.flaggable.id }, oldMarkers);
            newMarkers.markers[this.flaggable.id] = oldMarkers[this.macro.id]?.active || false;
        }

        return newMarkers;
    }
}
