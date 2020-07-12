import { MarkerToggler } from './markerToggler';
import { MacroMarker } from '../macros/macroMarker';
import { NotifiedLogger, ConsoleLogger } from '../utils/logger';
import { Settings } from '../utils/settings';

declare class Hotbar {
    _onHoverMacro(event: Event, ...args: unknown[]): void;
}

export function overrideMacroHover(hotbar: Hotbar): void {
    if (!hotbar) return;

    const original_onHoverMacro = hotbar._onHoverMacro;
    function _onHoverMacro(event, ...args) {
        original_onHoverMacro.call(hotbar, event, ...args);
        if (event.type !== 'mouseenter')
            return;

        const li: HTMLElement = event.currentTarget;
        const logger = new NotifiedLogger(new ConsoleLogger());
        const settings = Settings._load();
        const marker = new MacroMarker(logger, game.user, () => canvas.tokens.controlled);
        new MarkerToggler(game.macros, logger, settings, marker).showTooltip(li, canvas.tokens.controlled[0]);
    }

    hotbar._onHoverMacro = _onHoverMacro;
}