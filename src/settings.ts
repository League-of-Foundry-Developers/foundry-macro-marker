import CONSTANTS from './constants';

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