import { Flaggable } from './flags';
import { HotbarMarker } from './hotbarMarker';
import { MacroMarker } from './macroMarker';
import CONSTANTS from './constants';
import { Settings } from './settings';

Hooks.on('init', () => {
    game.settings.register(CONSTANTS.module.name, Settings.keys.dimInactiveMacros, {
        name: 'Dim inactive macros',
        hint: 'Makes inactive macros on the hotbar less bright.',
        scope: 'world',
        config: true,
        default: 5,
        type: Boolean
    });
    game.settings.register(CONSTANTS.module.name, Settings.keys.defaultColour, {
        name: 'Default colour',
        hint: 'The default colour for active macros. Must be a valid CSS colour (e.g. hex, rgba or named).',
        scope: 'world',
        config: true,
        default: 'white',
        type: String
    });
});

Hooks.on('ready', () => {
    (<any>window).MacroMarker = new MacroMarker(Settings._load(), game.user);
});

const timers = {};
function delayCallback(callback: (...args: unknown[]) => boolean, ...args: unknown[]) {
    if (timers[callback.name])
        window.clearTimeout(timers[callback.name]);

    timers[callback.name] = window.setTimeout(() => callback(...args), 100);
}

function renderMarkers(hotbar: HTMLElement) {
    const token: Flaggable | undefined = canvas.tokens.controlled[0];
    const hotbarMarker = new HotbarMarker(game.macros, Settings._load(), new MacroMarker(Settings._load(), game.user));
    hotbarMarker.showMarkers(hotbar, token);

    return true;
}

function renderHotbars() {
    const hotbar = document.getElementById('action-bar');
    const customHotbar = document.getElementById('custom-action-bar');
    [ hotbar, customHotbar ].filter(x => x).map(renderMarkers);

    return true;
}

Hooks.on('renderHotbar', (_, hotbar) => delayCallback(renderMarkers, hotbar[0]));
Hooks.on('renderCustomHotbar', (_, hotbar) => delayCallback(renderMarkers, hotbar[0]));
Hooks.on(`${CONSTANTS.hooks.markerUpdated}`, () => delayCallback(renderHotbars));
Hooks.on('controlToken', () => delayCallback(renderHotbars));