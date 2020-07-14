import { ConsoleLogger } from '../utils/logger';
import { Flaggable } from '../macros/macroMarkerFlags';
import { MarkerConfigurationFlags } from './markerConfigurationFlags';
import CONSTANTS from '../utils/constants';
import { Settings } from '../utils/settings';
import { MarkerConfiguration } from './markerConfiguration';

export class MacroMarkerConfigTab {
    public static init(): void {
        Hooks.on('renderMacroConfig', (_, jhtml, data) => { 
            const macro = game.macros.get(data.entity._id);
            MacroMarkerConfigTab.renderConfig(Settings._load(), jhtml[0], macro);
            return true;
        });
    }
    
    private static async renderConfig(settings: Settings, html: HTMLElement, macro: Macro & Flaggable) {
        const logger = new ConsoleLogger();
        const dataFlags = new MarkerConfigurationFlags(logger, macro);
        const data: MarkerConfiguration = dataFlags.getData();
        data['module'] = CONSTANTS.module.name;
        data.colour = data.colour || settings.defaultColour;
        data.icon = data.icon || (<any>macro.data).img;
        data.tooltip = data.tooltip || (<any>macro.data).name;

        const template = await renderTemplate('modules/macro-marker/templates/macro-marker-config.html', data);
        // renderTemplate returns string instead of HTMLElement...
        MacroMarkerConfigTab.addTab(html, <string><unknown>template);
    }

    private static addTab(html: HTMLElement, template: string) {
        const nav = document.createElement('nav');
        nav.classList.add('tabs');

        const macroNav = document.createElement('a');
        macroNav.classList.add('item', 'active');
        macroNav.setAttribute('data-tab', 'macro');
        macroNav.text = 'Macro';

        const markerNav = document.createElement('a');
        markerNav.classList.add('item');
        markerNav.setAttribute('data-tab', CONSTANTS.module.name);
        markerNav.text = 'Marker';

        nav.append(macroNav, markerNav);

        const content = document.createElement('section');
        content.classList.add('tab-content');
        
        const macroTab = document.createElement('div');
        macroTab.classList.add('tab', 'flexcol');
        macroTab.setAttribute('data-tab', 'macro');

        const macroInputs = html.querySelectorAll('form>*');
        for(const macroInput of macroInputs) {
            macroTab.appendChild(macroInput);
        }

        const markerTab = document.createElement('div');
        markerTab.classList.add('tab', 'flexcol');
        markerTab.setAttribute('data-tab', CONSTANTS.module.name);
        markerTab.innerHTML = template;

        content.append(macroTab, markerTab);

        html.querySelector('form')?.append(content);
        html.querySelector('form')?.before(nav);

        const tabs = new TabsV2({navSelector: '.tabs', contentSelector: '.tab-content', initial: 'macro', callback: () => { /* */ } });
        tabs.bind(html);

        const iconInput = <HTMLInputElement>markerTab.querySelector('input[type="hidden"]');
        const iconImg = <HTMLImageElement>markerTab.querySelector('.sheet-header img');
        const fileBrowser = FilePicker.fromButton(iconInput, {});
        iconImg.addEventListener('click', () => {
            fileBrowser.render(true);
        });
        iconInput.addEventListener('change', () => {
            iconImg.src = iconInput.value;
        });
    }
}