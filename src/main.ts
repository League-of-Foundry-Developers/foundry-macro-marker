import { MacroMarker } from './macros/macroMarker';
import CONSTANTS from './utils/constants';
import { registerSettings } from './utils/settings';
import { ConsoleLogger, NotifiedLogger } from './utils/logger';
import { MacroMarkerConfigTab } from './markerConfiguration/macroMarkerConfig';
import { RemoteExecutor } from './remoteExecutor';
import { Extensions } from './utils/foundry';
import { renderHotbars, renderMarkers, saveMacroConfiguration, delayCallback } from './controller';
import { overrideMacroHover } from './hotbar/overrides';

Hooks.on('init', () => {
    Extensions.addEntityMarkerTypes();
    registerSettings();
    overrideMacroHover();
});

Hooks.on('ready', () => {
    const logger = new NotifiedLogger(new ConsoleLogger());
    RemoteExecutor.init(logger);
    window['MacroMarker'] = new MacroMarker(logger, game.user, () => canvas.tokens.controlled);
    
    MacroMarkerConfigTab.init();
});

Hooks.on('controlToken', () => delayCallback(renderHotbars));
Hooks.on('renderHotbar', (_, hotbar) => delayCallback(renderMarkers, hotbar[0]));
Hooks.on('renderCustomHotbar', (_, hotbar) => delayCallback(renderMarkers, hotbar[0]));

// Save macro configuration
Hooks.on('preUpdateMacro', (macro, data) => {
    const activeData = data[CONSTANTS.module.name];
    if (!activeData)
        return;

    saveMacroConfiguration(macro, activeData);

    return true;
});

Hooks.on('updateMacro', (macro, data) => {
    if (data.flags?.[CONSTANTS.module.name])
        delayCallback(renderHotbars);
});

Hooks.on('updateActor', (actor, data) => {
    if (!data.flags?.[CONSTANTS.module.name])
        delayCallback(renderHotbars);
});

Hooks.on('updateToken', (scene, tokenData, updateData) => {
    if (updateData.flags?.[CONSTANTS.module.name])
        return;

    if (!updateData.actorData)
        return;

    delayCallback(renderHotbars);
});
