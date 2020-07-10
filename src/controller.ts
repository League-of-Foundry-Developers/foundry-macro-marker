import { Flaggable } from './macros/macroMarkerFlags';
import { MarkerToggler } from './hotbar/markerToggler';
import { MacroMarker } from './macros/macroMarker';
import { Settings } from './utils/settings';
import { ConsoleLogger, NotifiedLogger } from './utils/logger';
import { MarkerConfigurationFlags } from './markerConfiguration/markerConfigurationFlags';
import { MarkerConfiguration } from './markerConfiguration/markerConfiguration';
import CONSTANTS from './utils/constants';

export function renderMarkers(hotbar: HTMLElement): boolean {
    const logger = new NotifiedLogger(new ConsoleLogger());
    const settings = Settings._load();
    const token: Token & Flaggable | undefined = canvas.tokens.controlled[0];
    const hotbarMarker = new MarkerToggler(
        game.macros,
        logger,
        settings,
        new MacroMarker(logger, Settings._load(), game.user, () => canvas.tokens.controlled));

    hotbarMarker.showMarkers(hotbar, token);

    return true;
}
export function renderHotbars(): boolean {
    const hotbar = document.getElementById('action-bar');
    const customHotbar = document.getElementById('custom-action-bar');
    [ hotbar, customHotbar ].filter(x => x).map(renderMarkers);

    return true;
}

export function saveMacroConfiguration(macro: Macro, activeData: MarkerConfiguration): boolean {
    const logger = new NotifiedLogger(new ConsoleLogger());
    const flags = new MarkerConfigurationFlags(logger, macro);
    const oldData = flags.getData();
    flags.setData(Object.assign(oldData, activeData));

    return true;
}

export function updateColour(colour: string): string {
    if (colour.startsWith('#'))
        return colour;

    const ctx = document.createElement('canvas')?.getContext('2d');
    ctx!.fillStyle = colour;
    const newColour = ctx!.fillStyle;
    if (newColour.startsWith('#'))
        game.settings.set(CONSTANTS.module.name, Settings.keys.defaultColour, newColour);
    else
        ui.notifications.warn(`Macro Marker: Default colour '${colour}' is not a valid colour.`);
    return colour;
}

const timers = {};
export function delayCallback(callback: (...args: unknown[]) => boolean, ...args: unknown[]): void {
    if (timers[callback.name])
        window.clearTimeout(timers[callback.name]);

    timers[callback.name] = window.setTimeout(() => callback(...args), 100);
}

