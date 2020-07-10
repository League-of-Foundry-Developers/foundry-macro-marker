import { MarkerTypes } from '../remoteExecutor';

declare global {
    interface Entity {
        markerType: MarkerTypes
    }
    interface PlaceableObject {
        markerType: MarkerTypes,
    }
}

export class Extensions {
    static addEntityMarkerTypes(): void {
        if (Actor.prototype['markerType']) {
            console.warn('Macro Marker | Actor already had a property or method named "markerType"');
        }
        Actor.prototype['markerType'] = 'Token'; // Actors must be saved along with Token markers.

        if (User.prototype['markerType']) {
            console.warn('Macro Marker | User already had a property or method named "markerType"');
        }
        User.prototype['markerType'] = 'User';

        if (Macro.prototype['markerType']) {
            console.warn('Macro Marker | Macro already had a property or method named "markerType"');
        }
        Macro.prototype['markerType'] = 'Macro';

        if (Token.prototype['markerType']) {
            console.warn('Macro Marker | Token already had a property or method named "markerType"');
        }
        Token.prototype['markerType'] = 'Token';
    }
}