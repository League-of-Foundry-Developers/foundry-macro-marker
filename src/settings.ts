import CONSTANTS from './constants';

export interface ClientSettingsReader {
    get<T>(scope: string, key: string): T;
}

export class Settings {
    dimInactive: boolean;
    defaultColour: string;

    static keys = {
        dimInactiveMacros: 'dimInactive',
        defaultColour: 'defaultColour'
    }

    public load(s: ClientSettingsReader) : Settings {
        this.dimInactive = this.getSetting(s, Settings.keys.dimInactiveMacros);
        this.defaultColour = this.getSetting(s, Settings.keys.defaultColour);

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