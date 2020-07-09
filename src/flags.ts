import CONSTANTS from './constants';
import { Marker, MarkerCollection } from './marker';
import { Logger } from './logger';
import { ActiveData } from './macroConfig';
import { MarkerTypes } from './remoteExecutor';

export interface Flaggable {
    id: string;
    markerType: MarkerTypes,
    setFlag<T>(scope: string, key: string, value: T) : Promise<Flaggable>;
    unsetFlag(scope: string, key: string) : Promise<Flaggable>;
    getFlag<T>(scope: string, key: string) : T | undefined;
    
}

export class MarkerFlags {
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

export class DataFlags {
    private key = 'activeData';
    constructor(private logger: Logger, private flaggable: Flaggable) { }

    getData(): ActiveData {
        return this.flaggable.getFlag(CONSTANTS.module.name, this.key) || {};
    }

    setData(data: ActiveData): Promise<Flaggable> {
        return this.flaggable.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }
}