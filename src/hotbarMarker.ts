import { MacroMarker } from './macroMarker';
import { Flaggable, DataFlags } from './flags';
import { Settings } from './settings';
import { Logger } from './logger';

export class HotbarMarker {
    constructor(private macros: Map<string, Macro>, private logger: Logger, private settings: Settings, private marker: MacroMarker) { }

    showMarkers(hotbar: HTMLElement, token?: Token & Flaggable): void {
        const macros: NodeListOf<HTMLElement> = hotbar.querySelectorAll('li.macro');
        this.setCssVariables();

        for(const slot of [ ...macros ]) {
            const macroId = slot.getAttribute('data-macro-id');
            const macro = macroId && this.macros.get(macroId);
            if (!macro)
                continue;

            const isActive = this.marker.getMarker(macro, token) || false;
            const configuration = new DataFlags(this.logger, macro).getData();

            if (isActive) {
                slot.classList.add('macro-marker');
                const colour = configuration?.colour && configuration.colour !== '#000000'
                    ? configuration.colour
                    : 'var(--macro-marker-color)';
                slot.style.setProperty('color', colour);
            } else {
                slot.classList.remove('macro-marker');
                slot.style.setProperty('color', 'black'); //set color back to default just to be sure
            }

            const img = <HTMLImageElement>slot.querySelector('img.macro-icon');
            const key = <HTMLElement>slot.querySelector('span.macro-key');
           
            if (img && this.settings.dimInactive) {
                const inactiveImg = (<any>macro.data).img;
                const icon: string | undefined = configuration.icon; //macro.getFlag(CONSTANTS.module.name, 'activeData')?.icon;
                
                img.src = isActive && icon ? icon : inactiveImg;
                img.style.setProperty('filter', isActive ? 'brightness(100%)' : `brightness(${this.settings.dimInactive}%)`);
                slot.style.setProperty('z-index', img.style.getPropertyValue('z-index') + 1);
                if (key) key.style.setProperty('z-index', img.style.getPropertyValue('z-index') + 2);
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

        const isActive = this.marker.getMarker(macro, token) || false;
        const dataFlags = new DataFlags(this.logger, macro);
        if (!isActive)
            return;

        // We have to search the document for the tooltip, because it doesn't exist on event.target yet
        const tooltip = <HTMLElement>document.querySelector(`.macro.active[data-macro-id="${macroId}"] .tooltip`);
        tooltip.innerText = dataFlags.getData().tooltip || macro.name;
    }

    setCssVariables(): void {
        document.documentElement.style.setProperty('--macro-marker-width', this.settings.borderWidth + 'px');
        document.documentElement.style.setProperty('--macro-marker-speed', this.settings.animationSpeed + 's');
        document.documentElement.style.setProperty('--macro-marker-color', this.settings.defaultColour);
    }
}