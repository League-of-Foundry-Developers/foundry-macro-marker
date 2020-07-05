import { MacroMarker } from './macroMarker';
import { Flaggable, DataFlags } from './flags';
import { Settings } from './settings';
import CONSTANTS from './constants';
import { Logger } from './logger';

export class HotbarMarker {
    constructor(private macros: Map<string, Macro>, private logger: Logger, private settings: Settings, private marker: MacroMarker) { }

    showMarkers(hotbar: HTMLElement, token?: Token & Flaggable): void {
        const macros: NodeListOf<HTMLElement> = hotbar.querySelectorAll('li.macro');

        for(const slot of [ ...macros ]) {
            const macroId = slot.getAttribute('data-macro-id');
            const macro = macroId && this.macros.get(macroId);
            if (!macro)
                continue;

            const marker = this.marker.getMarker(macro, token);
            slot.style['border'] = marker?.active
                ? `1px solid ${marker.colour}`
                : '1px solid black';

            const img = <HTMLImageElement>slot.querySelector('img.macro-icon');
            const key = <HTMLElement>slot.querySelector('span.macro-key');
           
            if (img && this.settings.dimInactive) {
                const inactiveImg = (<any>macro.data).img;
                const icon: string | undefined = macro.getFlag(CONSTANTS.module.name, 'activeData')?.icon;
                
                img.src = marker?.active && icon ? icon : inactiveImg;
                img.style['filter'] = marker?.active ? 'brightness(100%)' : `brightness(${this.settings.dimInactive}%)`;
                slot.style['z-index'] = img.style['z-index'] + 1;
                if (key) key.style['z-index'] = img.style['z-index'] + 2;
            }
        }
    }

    showTooltip(li: HTMLElement, token?: Token & Flaggable): void{
        // only show tooltip for slots with a macro
        if (li.classList.contains('inactive'))
            return;

        const macroId = li.getAttribute('data-macro-id');
        if (!macroId) {
            this.logger.error('Show Tooltip | Cannot find data attribute on hotbar slot', li);
            return;
        }

        const macro = this.macros.get(macroId);
        if (!macro) {
            this.logger.error('Show Tooltip | Cannot find macro', macroId);
            return;
        }

        const marker = this.marker.getMarker(macro, token);
        const dataFlags = new DataFlags(this.logger, macro);
        if (!marker?.active)
            return;

        // We have to search the document for the tooltip, because it doesn't exist on event.target yet
        const tooltip = <HTMLElement>document.querySelector(`.macro.active[data-macro-id="${macroId}"] .tooltip`);
        tooltip.innerText = dataFlags.getData().tooltip ?? macro.name;
    }
}