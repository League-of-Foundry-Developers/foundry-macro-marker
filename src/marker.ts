import { MarkerTypes } from './remoteExecutor';

export interface Marker {
    active: boolean,
    colour: string
}

export interface MarkerCollection {
    [macroId: string]: Marker
}

export interface MacroMarkerCollection {
    markers: {
        [entityId: string]: boolean | undefined
    },
    type: MarkerTypes
}