import { MacroMarker } from './macroMarker';
import { Flaggable } from './flags';
import { Settings } from './settings';

export class HotbarMarker {
    constructor(private macros: Map<string, Macro>, private settings: Settings, private marker: MacroMarker) { }

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

            const img: HTMLElement | undefined = <HTMLElement>slot.querySelector('img.macro-icon');
            const key: HTMLElement | undefined = <HTMLElement>slot.querySelector('span.macro-key');
           
            if (img && this.settings.dimInactive) {
                img.style['filter'] = marker?.active ? 'brightness(100%)' : `brightness(${this.settings.dimInactive}%)`;
                slot.style['z-index'] = img.style['z-index'] + 1;
                if (key) key.style['z-index'] = img.style['z-index'] + 2;
            }
        }
    }
}