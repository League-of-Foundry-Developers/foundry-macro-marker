import CONSTANTS from './constants';
import { renderHotbars, updateColour } from '../controller';

export interface ClientSettingsReader {
    get<T>(scope: string, key: string): T;
}

export class Settings {
    animationSpeed: number;
    borderWidth: number;
    defaultColour: string;
    dimInactive: number;
    
    static keys = {
        animationSpeed: 'animationSpeed',
        borderWidth: 'borderWidth',
        defaultColour: 'defaultColour',
        dimInactiveMacros: 'dimInactive'
    }

    public load(s: ClientSettingsReader) : Settings {
        this.animationSpeed = this.getSetting(s, Settings.keys.animationSpeed);
        this.borderWidth = this.getSetting(s, Settings.keys.borderWidth);
        this.defaultColour = this.getSetting(s, Settings.keys.defaultColour);
        this.dimInactive = this.getSetting(s, Settings.keys.dimInactiveMacros);

        return this;
    }

    /**
     * Helper method to quickly construct Settings from game.settings
     */
    static _load(): Settings {
        return new Settings().load(game.settings); 
    }

    private getSetting<T>(settings: ClientSettingsReader, key: string) {
        return settings.get<T>(CONSTANTS.module.name, key);
    }
}

export function registerSettings(): void {
    game.settings.register(CONSTANTS.module.name, Settings.keys.dimInactiveMacros, {
        name: game.i18n.localize('macro-marker.settings.dimInactive.name'),
        hint: game.i18n.localize('macro-marker.settings.dimInactive.hint'),
        scope: 'world',
        config: true,
        default: 65,
        type: Number,
        range: { min: 50, max: 100, step: 5 },
        onChange: renderHotbars
    });

    game.settings.register(CONSTANTS.module.name, Settings.keys.defaultColour, {
        name: game.i18n.localize('macro-marker.settings.defaultColour.name'),
        hint: game.i18n.localize('macro-marker.settings.defaultColour.hint'),
        scope: 'world',
        config: true,
        default: '#ff0000',
        type: String,
        onChange: colour => { 
            updateColour(colour);
            renderHotbars();
        }
    });

    game.settings.register(CONSTANTS.module.name, Settings.keys.borderWidth, {
        name: game.i18n.localize('macro-marker.settings.borderWidth.name'),
        hint: game.i18n.localize('macro-marker.settings.borderWidth.hint'),
        scope: 'world',
        config: true,
        default: 2,
        type: Number,
        range: { min: 1, max: 4, step: 1 },
        onChange: renderHotbars
    });

    game.settings.register(CONSTANTS.module.name, Settings.keys.animationSpeed, {
        name: game.i18n.localize('macro-marker.settings.animationSpeed.name'),
        hint: game.i18n.localize('macro-marker.settings.animationSpeed.hint'),
        scope: 'client',
        config: true,
        default: 3,
        type: Number,
        range: { min: 0, max: 10, step: 0.5 },
        onChange: renderHotbars
    });
}
