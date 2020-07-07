import { Flaggable, DataFlags, MarkerFlags } from './flags';
import { HotbarMarker } from './hotbarMarker';
import { MacroMarker } from './macroMarker';
import CONSTANTS from './constants';
import { Settings } from './settings';
import { ConsoleLogger } from './logger';
import { MacroMarkerConfig } from './macroMarkerConfig';
import { MarkerCleaner } from './markerCleaner';

declare class Hotbar {
    _onHoverMacro(event: Event, ...args: any[]): void;
}

Hooks.on('init', () => {
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
        default: 'white',
        type: String,
        onChange: renderHotbars
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

    CONFIG.ui.hotbar =
        class extends Hotbar {
            _onHoverMacro(event, ...args) {
                super._onHoverMacro(event, ...args);
                if (event.type !== 'mouseenter')
                    return;

                const li: HTMLElement = event.currentTarget;
                const logger = new ConsoleLogger();
                const settings = Settings._load();
                const marker = new MacroMarker(logger, settings, game.user, () => canvas.tokens.controlled);
                new HotbarMarker(game.macros, logger, settings, marker).showTooltip(li, canvas.tokens.controlled[0]);
            }
        };
});

Hooks.on('ready', () => {
    const logger = new ConsoleLogger();
    (<any>window).MacroMarker = new MacroMarker(logger, Settings._load(), game.user, () => canvas.tokens.controlled);
    (<any>window).MarkerCleaner = new MarkerCleaner(logger);

    MacroMarkerConfig.init();
});

const timers = {};
function delayCallback(callback: (...args: unknown[]) => boolean, ...args: unknown[]) {
    if (timers[callback.name])
        window.clearTimeout(timers[callback.name]);

    timers[callback.name] = window.setTimeout(() => callback(...args), 100);
}

function renderMarkers(hotbar: HTMLElement) {
    const logger = new ConsoleLogger();
    const settings = Settings._load();
    const token: Token & Flaggable | undefined = canvas.tokens.controlled[0];
    const hotbarMarker = new HotbarMarker(
        game.macros,
        logger,
        settings,
        new MacroMarker(logger, Settings._load(), game.user, () => canvas.tokens.controlled));
        
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
// Hooks.on(`${CONSTANTS.hooks.markerUpdated}`, () => delayCallback(renderHotbars));
Hooks.on('controlToken', () => delayCallback(renderHotbars));

Hooks.on('preUpdateMacro', (macro, data) => {
    const activeData = data[CONSTANTS.module.name];
    if (!activeData)
        return;

    const flags = new DataFlags(new ConsoleLogger(), macro);
    const oldData = flags.getData();
    flags.setData(Object.assign(oldData, activeData));

    return true;
});

Hooks.on('updateActor', (actor, data) => {
    if (data.flags?.[CONSTANTS.module.name])
        return;

    const logger = new ConsoleLogger();
    const settings = Settings._load();
    const token = canvas.tokens.controlled[0];
    const macros: (Macro & Flaggable)[] = game.user.getHotbarMacros().map(slot => (<any>slot).macro).filter(x => x);
    for(const macro of macros) {
        const data = new DataFlags(logger, macro).getData();
        const marker = new MacroMarker(logger, settings, game.user, () => canvas.tokens.controlled);
        
        if (!data.trigger) {
            continue;
        }
        const trigger = Function(`return function(actor) {
            ${data.trigger}
        }`)();
        const isActive = trigger.call(macro, actor);
        if (typeof isActive !== 'boolean') {
            ui.notifications.error(`Trigger for macro marker on '${macro.name}' does not return a boolean value.`);
            continue;
        }
        // TODO: move this logic
        const userFlags = new MarkerFlags(logger, game.user);
        const tokenFlags = token && new MarkerFlags(logger, token);
        const markerData = userFlags.getMarkers()[macro.id] 
            ? { user: game.user } 
            : tokenFlags?.getMarkers()[macro.id]
                ? { token: token }
                : { };
        if (isActive) {
            marker.activate(macro, markerData);
        } else {
            marker.deactivate(macro, markerData);
        }
    }
});