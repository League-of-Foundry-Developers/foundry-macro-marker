import { MarkerTypes } from './remoteExecutor';

export interface MacroMarkerCollection {
    markers: {
        [entityId: string]: boolean | undefined
    },
    type: MarkerTypes
}