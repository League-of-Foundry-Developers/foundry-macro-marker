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
        name: 'Inactive macro brightness',
        hint: 'Makes inactive macros on the hotbar less bright. Set to 100 to disable the effect.',
        scope: 'world',
        config: true,
        default: 65,
        type: Number,
        range: { min: 50, max: 100, step: 5 },
        onChange: renderHotbars
    });

    game.settings.register(CONSTANTS.module.name, Settings.keys.defaultColour, {
        name: 'Default colour',
        hint: 'The default colour for active macros. Must be a valid CSS colour (e.g. hex, rgba or named).',
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
        name: 'Border width',
        hint: 'The width for the active macro border.',
        scope: 'world',
        config: true,
        default: 2,
        type: Number,
        range: { min: 1, max: 4, step: 1 },
        onChange: renderHotbars
    });

    game.settings.register(CONSTANTS.module.name, Settings.keys.animationSpeed, {
        name: 'Animation speed',
        hint: 'The number of second it takes to complete a single animation. Use 0 to turn off animations.',
        scope: 'client',
        config: true,
        default: 3,
        type: Number,
        range: { min: 0, max: 10, step: 0.5 },
        onChange: renderHotbars
    });
}