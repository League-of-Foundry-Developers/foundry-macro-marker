import { Flaggable } from './flags';
import { HotbarMarker } from './hotbarMarker';
import { MacroMarker } from './macroMarker';
import CONSTANTS from './constants';

Hooks.on('ready', () => {
    (<any>window).MacroMarker = new MacroMarker(game.user);
});

const timers = {};
function delayCallback(callback: (...args: unknown[]) => boolean, ...args: unknown[]) {
    if (timers[callback.name])
        window.clearTimeout(timers[callback.name]);

    timers[callback.name] = window.setTimeout(() => callback(...args), 100);
}

function renderMarkers(hotbar: HTMLElement) {
    const token: Flaggable | undefined = canvas.tokens.controlled[0];
    const hotbarMarker = new HotbarMarker(game.macros, new MacroMarker(game.user));
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