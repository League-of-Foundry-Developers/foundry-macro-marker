import CONSTANTS from './constants';
import { Marker, MarkerCollection, MacroMarkerCollection } from './marker';
import { Logger } from './logger';
import { MarkerTypes } from './remoteExecutor';
import { ActiveData as MarkerConfiguration } from './macroMarkerConfig';

export class Identifiable {
    id: string;
    markerType: MarkerTypes;
}

export interface Flaggable extends Identifiable {
    setFlag<T>(scope: string, key: string, value: T) : Promise<Flaggable>;
    unsetFlag(scope: string, key: string) : Promise<Flaggable>;
    getFlag<T>(scope: string, key: string) : T | undefined;
}

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

export class MacroMarkerFlags {
    private readonly key = 'markers';

    constructor(private logger: Logger, private macro: Macro) { }

    addMarker(entity: Identifiable, isActive: boolean): Promise<Flaggable> { 
        const existingMarkers = this.getMarkers();
        if (existingMarkers.type !== entity.markerType) {
            existingMarkers.markers = {};
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

// TODO: implement using 'get old flags + add new flags + wipe old flags'
// Can only be used once colour is in Macro Marker configuration. (merge with branch!)
export class MigratingMarkerFlags extends MacroMarkerFlags {
    // addMarker(entity: Identifiable, isActive: boolean);
    // setMarkers(data: MacroMarkerCollection): Promise<Flaggable>;
    // getMarkers(): MacroMarkerCollection;
    // unsetMarkers(macroId: string): Promise<Flaggable>;
}

export class DataFlags {
    private key = 'activeData';
    constructor(private logger: Logger, private flaggable: Flaggable) { }

    getData(): MarkerConfiguration {
        return this.flaggable.getFlag(CONSTANTS.module.name, this.key) || {};
    }

    setData(data: MarkerConfiguration): Promise<Flaggable> {
        return this.flaggable.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }
}
