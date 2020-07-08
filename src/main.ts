import { Flaggable, DataFlags } from './flags';
import { HotbarMarker } from './hotbarMarker';
import { MacroMarker } from './macroMarker';
import CONSTANTS from './constants';
import { Settings } from './settings';
import { ConsoleLogger, NotifiedLogger } from './logger';
import { MacroConfig } from './macroConfig';
import { MarkerCleaner } from './markerCleaner';
import { RemoteExecutor } from './remoteExecutor';
import { Extensions } from './foundry';

declare class Hotbar {
    _onHoverMacro(event: Event, ...args: any[]): void;
}

Hooks.on('init', () => {
    Extensions.addEntityMarkerTypes();
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
                const logger = new NotifiedLogger(new ConsoleLogger());
                const settings = Settings._load();
                const marker = new MacroMarker(logger, settings, game.user, () => canvas.tokens.controlled);
                new HotbarMarker(game.macros, logger, settings, marker).showTooltip(li, canvas.tokens.controlled[0]);
            }
        };
});

Hooks.on('ready', () => {
    const logger = new NotifiedLogger(new ConsoleLogger());
    RemoteExecutor.init(logger);
    window['MacroMarker'] = new MacroMarker(logger, Settings._load(), game.user, () => canvas.tokens.controlled);
    window['MarkerCleaner'] = new MarkerCleaner(logger);
});

const timers = {};
function delayCallback(callback: (...args: unknown[]) => boolean, ...args: unknown[]) {
    if (timers[callback.name])
        window.clearTimeout(timers[callback.name]);

    timers[callback.name] = window.setTimeout(() => callback(...args), 100);
}

function renderMarkers(hotbar: HTMLElement) {
    const logger = new NotifiedLogger(new ConsoleLogger());
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
Hooks.on(`${CONSTANTS.hooks.markerUpdated}`, () => delayCallback(renderHotbars));
Hooks.on('controlToken', () => delayCallback(renderHotbars));

Hooks.on('renderMacroConfig', (macroConfig, html) => {
    const logger = new ConsoleLogger();
    const dataFlags = new DataFlags(logger, macroConfig.entity);
    const data = dataFlags.getData();
    new MacroConfig(logger, html[0]).addFields(data);

    return true;
});

Hooks.on('preUpdateMacro', (macro, data) => {
    const activeData = data[CONSTANTS.module.name];
    if (!activeData)
        return;

    const logger = new NotifiedLogger(new ConsoleLogger());
    const flags = new DataFlags(logger, macro);
    const oldData = flags.getData();
    flags.setData(Object.assign(oldData, activeData));

    return true;
});
