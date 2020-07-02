export interface Marker {
    active: boolean,
    colour: string
}

export interface MarkerCollection {
    [macroId: string]: Marker
}