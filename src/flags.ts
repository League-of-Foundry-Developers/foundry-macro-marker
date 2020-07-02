import CONSTANTS from './constants';
import { Marker, MarkerCollection } from './marker';

export interface Flaggable {
    setFlag<T>(scope: string, key: string, value: T) : Promise<Flaggable>;
    unsetFlag(scope: string, key: string) : Promise<Flaggable>;
    getFlag<T>(scope: string, key: string) : T | undefined;
}

export class MarkerFlags {
    private key = 'activeMacros';
    constructor(private flaggable: Flaggable) { }

    addMarker(macroId: string, marker: Marker): Promise<Flaggable> {
        const existingMarkers = this.getMarkers();
        existingMarkers[macroId] = marker;
        return this.setMarkers(existingMarkers);
    }

    setMarkers(data: MarkerCollection): Promise<Flaggable> {
        console.debug('Macro Marker | Setting Marker', this.flaggable, data);
        return this.flaggable.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => entity.setFlag(CONSTANTS.module.name, this.key, data));
    }

    getMarkers(): MarkerCollection {
        return this.flaggable.getFlag(CONSTANTS.module.name, this.key) || {};
    }
}