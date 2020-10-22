import { MacroMarker } from '../macros/macroMarker';
import { Flaggable } from '../macros/macroMarkerFlags';
import { MarkerConfigurationFlags } from '../markerConfiguration/markerConfigurationFlags';
import { Settings } from '../utils/settings';
import { Logger } from '../utils/logger';
import { MarkerConfiguration } from '../markerConfiguration/markerConfiguration';

export class MarkerToggler {
    private readonly markerClass = 'macro-marker';

    constructor(private macros: Map<string, Macro>, private logger: Logger, private settings: Settings, private marker: MacroMarker) { }

    showMarkers(hotbar: HTMLElement, token?: Token): void {
        const slots: NodeListOf<HTMLElement> = hotbar.querySelectorAll('li.macro');
        this.setCssVariables();

        for(const slot of [ ...slots ]) {
            const macroId = slot.getAttribute('data-macro-id');
            const macro = macroId && this.macros.get(macroId);
            if (!macro)
                continue;

            this.updateMacroAppearance(macro, slot, token);
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

        const isActive = this.marker.isActive(macro, { entity: token });
        const dataFlags = new MarkerConfigurationFlags(this.logger, macro);
        if (!isActive)
            return;

        // We have to search the document for the tooltip, because it doesn't exist on event.target yet
        const tooltip = <HTMLElement>document.querySelector(`.macro.active[data-macro-id="${macroId}"] .tooltip`);
        tooltip.innerText = dataFlags.getData().tooltip || macro.name;
    }

    private updateMacroAppearance(macro: Macro, slot: HTMLElement, selectedToken?: Token) {
        const { isActive, colour } = this.marker.isActiveWithColour(macro, { entity: selectedToken });
        const configuration = new MarkerConfigurationFlags(this.logger, macro).getData();
        if (colour) configuration.colour = colour;

        const img = <HTMLImageElement>slot.querySelector('img.macro-icon');
        const key = <HTMLElement>slot.querySelector('span.macro-key');

        if (isActive) {
            this.showMarker(macro, slot, configuration, img, key);
        } else {
            this.hideMarker(macro, slot, img, key);
        }
    }

    private hideMarker(macro: Macro, slot: HTMLElement, img?: HTMLImageElement, key?: HTMLElement) {
        slot.classList.remove(this.markerClass);
        slot.style.setProperty('color', 'black'); //set color back to default just to be sure

        if (img) {
            img.src = (<any>macro.data).img;
            img.style.setProperty('filter', `brightness(${this.settings.dimInactive || 100}%)`);
            this.fixSlotZIndex(slot, img, key);
        }
    }

    private showMarker(macro: Macro, slot: HTMLElement, configuration: MarkerConfiguration, img?: HTMLImageElement, key?: HTMLElement) {
        if (!slot.classList.contains(this.markerClass))
            slot.classList.add(this.markerClass);

        const colour = configuration?.colour && configuration.colour !== '#000000'
            ? configuration.colour
            : 'var(--macro-marker-color)';

        slot.style.setProperty('color', colour);

        if (img) {
            const inactiveImg = (<any>macro.data).img;
            const icon: string | undefined = configuration.icon;

            img.src = icon ? icon : inactiveImg;
            img.style.setProperty('filter', 'brightness(100%)');
            this.fixSlotZIndex(slot, img, key);
        }
    }

    private fixSlotZIndex(slot: HTMLElement, img: HTMLImageElement, key?: HTMLElement | undefined) {
        slot.style.setProperty('z-index', img.style.getPropertyValue('z-index') + 1);
        if (key)
            key.style.setProperty('z-index', img.style.getPropertyValue('z-index') + 2);
    }

    private setCssVariables(): void {
        document.documentElement.style.setProperty('--macro-marker-width', this.settings.borderWidth + 'px');
        document.documentElement.style.setProperty('--macro-marker-speed', this.settings.animationSpeed + 's');
        document.documentElement.style.setProperty('--macro-marker-color', this.settings.defaultColour);
    }
}