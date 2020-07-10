import { MarkerToggler } from './markerToggler';
import { MacroMarker } from '../macros/macroMarker';
import { NotifiedLogger, ConsoleLogger } from '../utils/logger';
import { Settings } from '../utils/settings';

declare class Hotbar {
    _onHoverMacro(event: Event, ...args: unknown[]): void;
}

export function overrideMacroHover(): void {
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
                new MarkerToggler(game.macros, logger, settings, marker).showTooltip(li, canvas.tokens.controlled[0]);
            }
        };
}