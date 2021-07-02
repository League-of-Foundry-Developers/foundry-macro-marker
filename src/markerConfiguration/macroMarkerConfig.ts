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
            const dialog: HTMLElement = jhtml[0];
            const formParent = dialog.tagName.toLowerCase() === 'form' ? dialog.parentElement : dialog;
            if (formParent)
                MacroMarkerConfigTab.renderConfig(Settings._load(), formParent, macro);

            return true;
        });
    }
    
    private static async renderConfig(settings: Settings, formParent: HTMLElement, macro: Macro & Flaggable) {
        const logger = new ConsoleLogger();
        const dataFlags = new MarkerConfigurationFlags(logger, macro);
        const data: MarkerConfiguration = dataFlags.getData();
        data['module'] = CONSTANTS.module.name;
        data.colour = data.colour || settings.defaultColour;
        data.icon = data.icon || (<any>macro.data).img;
        data.tooltip = data.tooltip || (<any>macro.data).name;

        const template = await renderTemplate('modules/macro-marker/templates/macro-marker-config.html', data);
        // renderTemplate returns string instead of HTMLElement...
        MacroMarkerConfigTab.addTab(formParent, <string><unknown>template);
    }

    private static addTab(formParent: HTMLElement, template: string) {
        const nav = document.createElement('nav');
        nav.classList.add('tabs');

        const macroNav = document.createElement('a');
        macroNav.classList.add('item', 'active');
        macroNav.setAttribute('data-tab', 'macro');
        macroNav.text = game.i18n.localize('macro-marker.navbar.macro');

        const markerNav = document.createElement('a');
        markerNav.classList.add('item');
        markerNav.setAttribute('data-tab', CONSTANTS.module.name);
        markerNav.text = game.i18n.localize('macro-marker.navbar.marker');;

        nav.append(macroNav, markerNav);

        const content = document.createElement('section');
        content.classList.add('tab-content');
        
        const macroTab = document.createElement('div');
        macroTab.classList.add('tab', 'flexcol');
        macroTab.setAttribute('data-tab', 'macro');

        const macroInputs = formParent.querySelectorAll('form>*');
        for(const macroInput of macroInputs) {
            macroTab.appendChild(macroInput);
        }

        const markerTab = document.createElement('div');
        markerTab.classList.add('tab', 'flexcol');
        markerTab.setAttribute('data-tab', CONSTANTS.module.name);
        markerTab.innerHTML = template;

        content.append(macroTab, markerTab);

        formParent.querySelector('form')?.append(content);
        formParent.querySelector('form')?.before(nav);

        const tabs = new TabsV2({navSelector: '.tabs', contentSelector: '.tab-content', initial: 'macro', callback: () => { /* */ } });
        tabs.bind(formParent);

        const iconInput = <HTMLButtonElement>markerTab.querySelector('button[data-type="image"]');
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
